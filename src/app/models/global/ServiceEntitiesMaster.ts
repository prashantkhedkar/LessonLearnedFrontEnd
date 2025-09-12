export interface ServiceEntitiesMaster {
    entityId: number;
    entityNameEn: string;
    entityNameAr: string;
    description: string;
    displayOrder: number;
    isDefault: Boolean;
    isActive: boolean;
    isMultiselectUnit?: boolean; // Added to match API response
}