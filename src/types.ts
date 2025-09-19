export interface Address {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
}

export interface User {
    id: number;
    name: {
        firstName: string;
        lastName: string;
    }
    age: number;
    address?: Address;
    additional_info?: any;
}

export interface CsvRow {
    [key: string]: string;
}