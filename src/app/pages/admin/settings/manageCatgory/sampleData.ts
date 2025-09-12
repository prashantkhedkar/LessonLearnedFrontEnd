export interface Category {
    id: number;
    name: string;
    description: string;
    icon: string;
}

export const sampleCategories: Category[] = [
    {
        id: 1,
        name: "Electronics",
        description: "Electronic devices and accessories",
        icon: "Settings"
    },
    {
        id: 2,
        name: "Furniture",
        description: "Home and office furniture items",
        icon: "ShoppingCart"
    },
    {
        id: 3,
        name: "Books",
        description: "Books and educational materials",
        icon: "Favorite"
    },
    {
        id: 4,
        name: "Sports",
        description: "Sports equipment and accessories",
        icon: "Build"
    }
];