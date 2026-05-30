export type DataItem = {
    "🔑name": string;
    // "🖼️": string;
    [key: string]: any;
}

export type DataList = DataItem[];

export type DATA_CATEGORIES = {
    [key: string]: DataList;
}
export type SYNONYM_ITEM = {
    value: string;
    synonym: string;
    status: string;
    note: string;
};
export type REPLACE_CONFIG = {
    images: KEY_VALUES;
    locations: KEY_VALUES;
    status: KEY_VALUES;
}