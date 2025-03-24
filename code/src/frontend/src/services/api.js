// const BASE_URL = 'http://localhost:8000';

// export const processDocuments = async (files) => {
//   const formData = new FormData();
//   files.forEach(file => {
//     formData.append('files', file);
//   });

//   const response = await fetch(`${BASE_URL}/documents/upload`, {
//     method: 'POST',
//     body: formData
//   });

//   if (!response.ok) {
//     throw new Error('Failed to process documents');
//   }

//   return await response.json();
// };

// export const extractRules = async (query) => {
//   const response = await fetch(`${BASE_URL}/rules/extract`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ query })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to extract rules');
//   }

//   return await response.json();
// };

// export const listRules = async () => {
//   const response = await fetch(`${BASE_URL}/rules/list`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch rules');
//   }
//   return await response.json();
// };

// export const generateValidationCode = async (ruleId) => {
//   const response = await fetch(`${BASE_URL}/validation/generate?rule_id=${ruleId}`, {
//     method: 'POST'
//   });

//   if (!response.ok) {
//     throw new Error('Failed to generate validation code');
//   }

//   const data = await response.json();
//   return data.validation_functions[0].code;
// };

// export const validateData = async (ruleId, data) => {
//   const response = await fetch(`${BASE_URL}/data/validate`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       rule_id: ruleId,
//       data: data
//     })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to validate data');
//   }

//   const result = await response.json();
//   return result.results;
// };

// export const listFlaggedItems = async () => {
//   const response = await fetch(`${BASE_URL}/flagged/list`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch flagged items');
//   }
//   return await response.json();
// };

// export const generateRemediation = async (flaggedId) => {
//   const response = await fetch(`${BASE_URL}/remediation/generate`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ flagged_id: flaggedId })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to generate remediation');
//   }

//   return await response.json();
// };
// Mock API functions that simulate real API calls
export const processDocuments = async (files) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { message: `Processed ${files.length} documents successfully` };
};

export const extractRules = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    rules: [
      {
        rule_name: "Sample Rule",
        rule_description: "Extracted from: " + query,
        rule_condition: "value > 100",
        error_message: "Value exceeds limit"
      }
    ]
  };
};

export const listRules = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    rules: [
      { id: 1, rule_name: "Amount Validation" },
      { id: 2, rule_name: "Date Format Check" },
      { id: 3, rule_name: "Currency Validation" }
    ]
  };
};

export const generateValidationCode = async (ruleId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    validation_functions: [{
      rule_id: ruleId,
      rule_name: "Sample Rule",
      code: `def validate_sample_rule(df):\n    """Sample validation rule"""\n    return df[df['value'] > 100]`,
      function_name: "validate_sample_rule"
    }]
  };
};

export const validateData = async (ruleId, data) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    results: [
      { row_index: 1, field: 'amount', error: 'Value exceeds limit' },
      { row_index: 3, field: 'date', error: 'Invalid date format' }
    ]
  };
};

export const listFlaggedItems = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    flagged_items: [
      { id: 1, rule_name: "Amount Check", field_name: "amount" },
      { id: 2, rule_name: "Date Validation", field_name: "date" },
      { id: 3, rule_name: "Currency Check", field_name: "currency" }
    ]
  };
};

export const generateRemediation = async (flaggedId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    remediation: `## Remediation Steps\n\n1. Fix the issue\n2. Verify the correction\n3. Document the change`
  };
};