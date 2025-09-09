const { nanoid } = require("nanoid");
const bookshelf = require("./bookshelf");

// Fungsi Menambahkan Buku
const addBookHandler = (request, h) => {
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

    if (readPage > pageCount) {
        const response = h.response({
            status: "fail",
            message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
        })
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finishedAt = pageCount === readPage;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        reading,
        finishedAt,
        insertedAt,
        updatedAt
    };
    bookshelf.push(newBook);

    const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        const response = h.response({
            status: "success",
            message: "Buku Berhasil ditambahkan",
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: "fail",
        message: "Gagal Menambahkan Buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;

};

// Fungsi Menampilkan keseluruhan Buku dan berdasarkan Id

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = bookshelf;

    // 🔍 Filter berdasarkan nama (non-case sensitive)
    if (name) {
        filteredBooks = filteredBooks.filter((book) =>
            book.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Filter berdasarkan status reading (0 atau 1)
    if (reading !== undefined) {
        const isReading = reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    // Filter berdasarkan status finished (0 atau 1)
    if (finished !== undefined) {
        const isFinished = finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }

    const response = h.response({
        status: "success",
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    });
    response.code(200);
    return response;
};

const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const book = bookshelf.find((n) => n.id === bookId);

    if (book) {
        const response = h.response({
            status: "success",
            data: {
                book: {
                    id: bookId,
                    name: book.name,
                    year: book.year,
                    author: book.author,
                    summary: book.summary,
                    publisher: book.publisher,
                    pageCount: book.pageCount,
                    readPage: book.readPage,
                    finishedAt: book.finishedAt,
                    reading: book.reading,
                    insertedAt: book.insertedAt,
                    updatedAt: book.updatedAt
                },
            },
        });
        response.code(200);
        return response;
    }

const response = h.response({
    status: "fail",
    message: "Buku Tidak ditemukan",
});
    response.code(404);
    return response;
};

// Fungsi Mengubah Buku dengan Method PUT

const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    const updatedAt = new Date().toISOString();

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: "Gagal memperbarui buku. Id tidak ditemukan",
        });
        response.code(404);
        return response;
    } else if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
        });
        response.code(400);
        return response;
    } else if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

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
        updatedAt,
    };

    const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui'
    });

    response.code(200);
    return response;
};



// Fungsi Menghapus Buku
const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
            status: "success",
            message: "Buku Berhasil dihapus",
        });
        response.code(200);
        return response;
    }
    const response = h.response({
        status: "fail",
        message: "Buku gagal dihapus. Id tidak ditemukan",
    })
    response.code(404);
    return response;
};



module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };