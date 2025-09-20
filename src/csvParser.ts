import type {User, CsvRow, Address} from './types.js';

export const parseCsv = (csvContent: string): Omit<User, 'id'>[] => {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('CSV must have at least header and one data row');
    }

    const headers = parseHeaders(lines[0]);
    const dataRows = lines.slice(1);

    return dataRows.map(row => parseRow(row, headers));
};

const parseHeaders = (headerLine: string): string[] => {
    return headerLine.split(',').map(header => header.trim());
};

const parseRow = (dataLine: string, headers: string[]): Omit<User, 'id'> => {
    const values = dataLine.split(',').map(value => value.trim());

    if (values.length !== headers.length) {
        throw new Error(`Mismatch with header length`);
    }

    const flatObject: CsvRow = {};
    headers.forEach((header, index) => {
        flatObject[header] = values[index];
    });

    return processRowData(flatObject);
};

const processRowData = (flatData: CsvRow): Omit<User, 'id'> => {
    const nestedData = convertToNested(flatData);

    const firstName = nestedData.name?.firstName || '';
    const lastName = nestedData.name?.lastName || '';

    if (!firstName || !lastName) {
        throw new Error('Missing required fields');
    }

    const name = { firstName, lastName };
    const age = parseInt(nestedData.age || '0');

    if (age <= 0) {
        throw new Error('Invalid age value');
    }

    const address: Address | undefined = nestedData.address;

    const additional_info: any = {};
    Object.keys(nestedData).forEach(key => {
        if (key !== 'name' && key !== 'age' && key !== 'address') {
            additional_info[key] = nestedData[key];
        }
    });

    return {
        name,
        age,
        address,
        additional_info: Object.keys(additional_info).length > 0 ? additional_info : undefined
    };
};

const convertToNested = (flatData: CsvRow): any => {
    const result: any = {};

    Object.keys(flatData).forEach(key => {
        const value = flatData[key];
        const keyParts = key.split('.');

        let current = result;

        for (let i = 0; i < keyParts.length - 1; i++) {
            const part = keyParts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }

        const finalKey = keyParts[keyParts.length - 1];
        current[finalKey] = value;
    });

    return result;
};