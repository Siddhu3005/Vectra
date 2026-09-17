export const paginate = (items, page, size) => items.slice((page - 1) * size, page * size);
export const pageCount = (items, size) => Math.max(1, Math.ceil(items.length / size));
