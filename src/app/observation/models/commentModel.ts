// Comment Models for Observation Approval Process Comments

export interface IComment {
    id: number;
    observationId: number;
    text: string;
    author: string;
    date: Date | string; // Allow both Date object and string from API
    isActive: boolean;
    createdAt: Date | string; // Allow both Date object and string from API
    updatedAt?: Date | string; // Allow both Date object and string from API
}
