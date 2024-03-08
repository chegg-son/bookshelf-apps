const books = [];
const RENDER_BOOK = 'render-book';
const SAVED_BOOK = 'storage-book';
const BOOK_KEY = 'BOOK_KEY';

function checkStorage() {
    if (typeof (Storage) === undefined) {
        alert('Local Storage tidak didukung di Browser yang digunakan!');
        return false;
    } else {
        return true;
    }
}

function saveBook() {
    if (checkStorage()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(BOOK_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_BOOK));
    }
}

function loadBookFromStorage() {
    const serializedBook = localStorage.getItem(BOOK_KEY);
    let book = JSON.parse(serializedBook);

    if (book !== null) {
        for (const i of book) {
            books.push(i);
        }
    }

    document.dispatchEvent(new Event(RENDER_BOOK));
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const searchBook = document.getElementById('searchInput');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        form.reset();
    });

    if (checkStorage()) {
        loadBookFromStorage();
    }

    function addBook() {
        const title = document.getElementById('titleInput').value;
        const author = document.getElementById('authorInput').value;
        const year = document.getElementById('yearInput').value;
        const isComplete = document.getElementById('isCompleteInput').checked;
        const id = generateId();

        const bookObject = generateBookObject(id, title, author, year, isComplete);
        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_BOOK));
        saveBook();
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year,
            isComplete
        }
    }

    searchBook.addEventListener('keyup', function (event) {
        const ul = document.getElementById('searchResult');
        const liList = document.querySelectorAll('#listItem')

        const searchQuery = event.target.value.trim();
        if (searchQuery === '') {
            ul.style.display = 'none';
        } else {
            ul.style.display = 'block';
        }

        for (i = 0; i < liList.length; i++) {
            const query = liList[i].innerText || liList[i].textContent;
            const words = query.split("-");
            console.log(words[0]);
            if (words[0].toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
                liList[i].style.display = '';
            } else {
                liList[i].style.display = 'none';
            }
        }
    })
});

function addListBookSearch() {
    var input, ul, li, i;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById('searchResult');
    ul.innerHTML = '';

    for (i = 0; i < books.length; i++) {
        const title = books[i].title;
        const author = books[i].author;
        const year = books[i].year;
        li = document.createElement("li");

        li.setAttribute("id", "listItem");
        if (books[i].isComplete) {
            li.innerHTML = `<a href="#book-${books[i].id}" onclick="smoothScroll(event, '${books[i].id}')"> ${title} - ${author} - ${year} | Selesai</a>`;
        } else {
            li.innerHTML = `<a href="#book-${books[i].id}" onclick="smoothScroll(event, '${books[i].id}')"> ${title} - ${author} - ${year} | Belum Selesai</a>`;
        }

        ul.appendChild(li);
    }
}

function smoothScroll(event, bookId) {
    event.preventDefault();
    const targetElement = document.getElementById(`book-${bookId}`);
    targetElement.scrollIntoView({ behavior: 'smooth' });
    targetElement.classList.add('blink');
    setTimeout(function () {
        targetElement.classList.remove('blink');
    }, 1300);
}

document.addEventListener(SAVED_BOOK, () => {
    console.log('Data buku tersimpan');
});

document.addEventListener(RENDER_BOOK, () => {
    addListBookSearch();
    const uncompletedBookList = document.getElementById('incomplete-item');
    const completedBookList = document.getElementById('complete-item');
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthorYear = document.createElement('p');
    textAuthorYear.innerText = bookObject.author + ' | ' + bookObject.year;

    const bookItem = document.createElement('div');
    bookItem.append(textTitle, textAuthorYear);
    bookItem.classList.add('book-item');

    const deleteItem = document.createElement('button');
    deleteItem.setAttribute('title', 'Hapus Buku');
    deleteItem.innerHTML = `<i class="fas fa-trash icon-large"></i>`;

    deleteItem.addEventListener('click', function () {
        showConfirmDialog(bookObject.title, bookObject.id);
    });

    const isCompleteItem = document.createElement('button');
    isCompleteItem.setAttribute('title', 'Ubah Status Buku');
    isCompleteItem.innerHTML = `<i class="fa-solid fa-arrows-rotate icon-large"></i>`;

    isCompleteItem.addEventListener('click', function () {
        bookObject.isComplete = !bookObject.isComplete;
        document.dispatchEvent(new Event(RENDER_BOOK));
        saveBook();
    });

    const actionItem = document.createElement('div');
    actionItem.classList.add('action-item');
    actionItem.append(deleteItem, isCompleteItem);

    const container = document.createElement('div');
    container.classList.add('items');
    container.append(bookItem, actionItem);

    container.setAttribute('id', `book-${bookObject.id}`);

    return container;
}

function showConfirmDialog(bookTitle, bookId) {
    const modal = document.getElementById('confirmDialog');
    const modalContent = modal.querySelector('.modal-content');
    const bookTitleElement = document.getElementById('bookTitle');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const closeButton = document.getElementsByClassName('close')[0];

    bookTitleElement.textContent = bookTitle;

    modal.style.display = 'block';

    confirmDeleteButton.onclick = function () {
        removeBookFromItem(bookId);
        closeDialog(modal, modalContent);
    }

    cancelDeleteButton.onclick = function () {
        closeDialog(modal, modalContent);
    }

    closeButton.onclick = function () {
        closeDialog(modal, modalContent);
    }
}

function closeDialog(modal, modalContent) {
    modal.classList.add('out');
    modalContent.classList.add('out');

    modal.addEventListener('animationend', function handler() {
        modal.style.display = 'none';
        modal.classList.remove('out');
        modalContent.classList.remove('out');
        modal.removeEventListener('animationend', handler);
    }, { once: true });
}

function removeBookFromItem(bookId) {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    books.splice(bookIndex, 1);

    document.dispatchEvent(new Event(RENDER_BOOK));
    saveBook();
}

function findBook(bookTitle) {
    return books.find((book) => book.title === bookTitle);
}

