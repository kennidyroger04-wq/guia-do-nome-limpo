(function (root, factory) {
  const tools = factory();
  if (typeof module === 'object' && module.exports) module.exports = tools;
  if (root) root.FinancialTools = tools;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => tools.bind(document));
  }
})(typeof window !== 'undefined' ? window : null, function () {
  const MAX_AMOUNT = 1_000_000_000;
  const MAX_MONTHS = 600;
  const MAX_MONTHLY_RATE_PERCENT = 100;
  const moneyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function validationError(message, fields) {
    const error = new Error(message);
    error.fields = fields;
    return error;
  }

  function parseLocalizedNumber(raw) {
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
    let value = String(raw ?? '').trim().replace(/[\s\u00a0]/g, '');
    if (!value) return NaN;
    let sign = '';
    if (value[0] === '-' || value[0] === '+') {
      sign = value[0];
      value = value.slice(1);
    }
    if (!value) return NaN;

    if (value.includes(',')) {
      if ((value.match(/,/g) || []).length !== 1) return NaN;
      const [whole, fraction] = value.split(',');
      const validWhole = /^\d+$/.test(whole) || /^\d{1,3}(?:\.\d{3})+$/.test(whole);
      if (!validWhole || !/^\d+$/.test(fraction)) return NaN;
      value = `${whole.replace(/\./g, '')}.${fraction}`;
    } else {
      if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) value = value.replace(/\./g, '');
      else if (!/^\d+(?:\.\d+)?$/.test(value)) return NaN;
    }

    const parsed = Number(`${sign}${value}`);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function amount(value, field, label, allowZero) {
    if (!Number.isFinite(value)) throw validationError(`Informe ${label} usando números válidos.`, [field]);
    if (value < 0 || (!allowZero && value === 0)) {
      throw validationError(`${label} deve ser ${allowZero ? 'zero ou maior' : 'maior que zero'}.`, [field]);
    }
    if (value > MAX_AMOUNT) {
      throw validationError(`${label} deve ser de, no máximo, R$ 1.000.000.000,00.`, [field]);
    }
    if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-7) {
      throw validationError(`${label} deve ter no máximo duas casas decimais.`, [field]);
    }
    return value;
  }

  function calculateDiscount(debtValue, discountPercent) {
    const debt = amount(debtValue, 'debt', 'o valor da dívida', false);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      throw validationError('O desconto deve estar entre 0% e 100%.', ['discount']);
    }
    const savings = debt * discountPercent / 100;
    return { savings, finalAmount: debt - savings };
  }

  function calculateBudget(income, essentials, variableExpenses, commitments) {
    const netIncome = amount(income, 'income', 'a renda líquida mensal', true);
    const essentialCosts = amount(essentials, 'essentials', 'as despesas essenciais', true);
    const variableCosts = amount(variableExpenses, 'variable', 'as despesas variáveis', true);
    const existingCommitments = amount(commitments, 'commitments', 'os compromissos financeiros', true);
    return {
      availableBalance: netIncome - essentialCosts - variableCosts - existingCommitments,
    };
  }

  function calculateInstallment(principal, periods, monthlyRatePercent) {
    const financedAmount = amount(principal, 'principal', 'o valor financiado', false);
    if (!Number.isInteger(periods) || periods < 1 || periods > MAX_MONTHS) {
      throw validationError(`A quantidade de parcelas deve ser um número inteiro entre 1 e ${MAX_MONTHS}.`, ['periods']);
    }
    if (!Number.isFinite(monthlyRatePercent) || monthlyRatePercent < 0 || monthlyRatePercent > MAX_MONTHLY_RATE_PERCENT) {
      throw validationError(`A taxa mensal deve estar entre 0% e ${MAX_MONTHLY_RATE_PERCENT}%.`, ['monthlyRate']);
    }

    const periodicRate = monthlyRatePercent / 100;
    const payment = periodicRate === 0
      ? financedAmount / periods
      : financedAmount * periodicRate / -Math.expm1(-periods * Math.log1p(periodicRate));
    const totalPaid = payment * periods;
    return {
      monthlyInstallment: payment,
      totalPaid,
      interestCost: totalPaid - financedAmount,
    };
  }

  function formatMoney(value) {
    return moneyFormatter.format(value);
  }

  function bind(documentRoot) {
    const configurations = [
      { id: 'discountCalculator', calculate: (v) => calculateDiscount(v.debt, v.discount) },
      { id: 'budgetCalculator', calculate: (v) => calculateBudget(v.income, v.essentials, v.variable, v.commitments) },
      { id: 'installmentCalculator', calculate: (v) => calculateInstallment(v.principal, v.periods, v.monthlyRate) },
    ];

    configurations.forEach(({ id, calculate }) => {
      const form = documentRoot.getElementById(id);
      if (!form) return;
      const errorBox = form.querySelector('[data-error]');
      const resultBox = form.querySelector('[data-results]');

      form.addEventListener('input', (event) => {
        if (event.target.matches('input')) event.target.removeAttribute('aria-invalid');
        if (errorBox) {
          errorBox.hidden = true;
          errorBox.textContent = '';
        }
        if (resultBox) resultBox.hidden = true;
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.querySelectorAll('input').forEach((input) => input.removeAttribute('aria-invalid'));
        try {
          const values = Object.fromEntries([...form.querySelectorAll('input[name]')].map((input) => [
            input.name,
            parseLocalizedNumber(input.value),
          ]));
          const result = calculate(values);
          Object.entries(result).forEach(([key, value]) => {
            const output = form.querySelector(`[data-output="${key}"]`);
            if (output) output.textContent = formatMoney(value);
          });
          if (errorBox) {
            errorBox.hidden = true;
            errorBox.textContent = '';
          }
          if (resultBox) resultBox.hidden = false;
        } catch (error) {
          if (errorBox) {
            errorBox.textContent = error.message;
            errorBox.hidden = false;
          }
          (error.fields || []).forEach((field) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) input.setAttribute('aria-invalid', 'true');
          });
          const firstInvalid = form.querySelector('input[aria-invalid="true"]');
          if (firstInvalid) firstInvalid.focus();
          if (resultBox) resultBox.hidden = true;
        }
      });
    });
  }

  return {
    MAX_AMOUNT,
    MAX_MONTHS,
    MAX_MONTHLY_RATE_PERCENT,
    parseLocalizedNumber,
    calculateDiscount,
    calculateBudget,
    calculateInstallment,
    formatMoney,
    bind,
  };
});
