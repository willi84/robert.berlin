export type DataItem = {
    "🔑name": string;
    // "🖼️": string;
    [key: string]: any;
}

export type DataList = DataItem[];

export type DATA_CATEGORIES = {
    [key: string]: DataList;
}