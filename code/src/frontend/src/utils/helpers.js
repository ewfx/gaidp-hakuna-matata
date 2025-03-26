export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const result = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const obj = {};
            const currentline = lines[i].split(',');
            
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }
            result.push(obj);
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    });
  };
  
  export const parseExcel = async (file) => {
    // In a real app, you would use a library like xlsx
    throw new Error('Excel parsing not implemented in this example');
  };