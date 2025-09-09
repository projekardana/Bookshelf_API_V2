const { nanoid } = require("nanoid");
const bookshelf = require("./bookshelf");

// Fungsi Menambahkan Buku
const addBookHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    if (!name) {
        const response = h.response({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku"
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: "fail",
            message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
        });
        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        insertedAt,
        updatedAt
    };

    bookshelf.push(newBook);

    const response = h.response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: {
            bookId: id,
        },
    });
    response.code(201);
    return response;
};

// Fungsi Menampilkan semua buku dan Berdasarkan ID
const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = bookshelf;

    if (name) {
        filteredBooks = filteredBooks.filter((book) =>
            book.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (reading !== undefined) {
        const isReading = reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    if (finished !== undefined) {
        const isFinished = finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }

    return h.response({
        status: "success",
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    }).code(200);
};

// Fungsi Menampilkan detail buku berdasarkan ID
const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const book = bookshelf.find((b) => b.id === bookId);

    if (!book) {
        return h.response({
            status: "fail",
            message: "Buku tidak ditemukan",
        }).code(404);
    }

    return h.response({
        status: "success",
        data: {
            book,
        },
    }).code(200);
};

// Fungsi Mengubah data buku dengan METHOD PUT
const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    if (!name) {
        return h.response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku"
        }).code(400);
    }

    if (readPage > pageCount) {
        return h.response({
            status: "fail",
            message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
        }).code(400);
    }

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index === -1) {
        return h.response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan"
        }).code(404);
    }

    const updatedAt = new Date().toISOString();
    const finished = pageCount === readPage;

    bookshelf[index] = {
        ...bookshelf[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        updatedAt,
    };

    return h.response({
        status: "success",
        message: "Buku berhasil diperbarui"
    }).code(200);
};

// Fungsi Menghapus buku
const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        return h.response({
            status: "success",
            message: "Buku berhasil dihapus"
        }).code(200);
    }
    return h.response({
        status: "fail",
        message: "Buku gagal dihapus. Id tidak ditemukan"
    }).code(404);

};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};