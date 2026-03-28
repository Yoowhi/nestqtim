export interface Pagination<T> {
    page: T[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}