require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/admin');
const Book = require('../models/Book');

const sampleBooks = [
  {
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    description: 'A landmark novel about the life of Okonkwo, an Igbo warrior in Nigeria, and the arrival of European missionaries.',
    price: 3500,
    category: 'fiction',
    isbn: '978-0385474542',
    publisher: 'Anchor Books',
    year: 1958,
    pages: 209,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/things-fall-apart.pdf',
    featured: true,
  },
  {
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    description: 'Set during the Biafran war, this novel follows three characters whose lives intersect in colonial and post-colonial Nigeria.',
    price: 4200,
    category: 'fiction',
    isbn: '978-1400095209',
    publisher: 'Knopf',
    year: 2006,
    pages: 433,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/half-of-a-yellow-sun.pdf',
    featured: true,
  },
  {
    title: 'Purple Hibiscus',
    author: 'Chimamanda Ngozi Adichie',
    description: 'A coming-of-age story set in Nigeria about a sheltered teenager living with her oppressive father.',
    price: 3800,
    category: 'fiction',
    year: 2003,
    pages: 307,
    fileFormat: 'EPUB',
    downloadUrl: 'https://www.example.com/books/purple-hibiscus.epub',
    featured: false,
  },
  {
    title: 'The Concubine',
    author: 'Elechi Amadi',
    description: 'A classic Nigerian novel exploring the tragic consequences of a beautiful woman bound to a sea-god.',
    price: 2800,
    category: 'local',
    year: 1966,
    pages: 216,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/the-concubine.pdf',
  },
  {
    title: 'Business Mathematics',
    author: 'Frank S. Budnick',
    description: 'A comprehensive introduction to mathematical methods used in business and economics.',
    price: 7500,
    category: 'academic',
    isbn: '978-0070088726',
    year: 2019,
    pages: 864,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/business-mathematics.pdf',
  },
  {
    title: 'Principles of Economics',
    author: 'N. Gregory Mankiw',
    description: 'One of the most popular economics textbooks worldwide, covering micro and macroeconomic principles.',
    price: 12000,
    category: 'academic',
    isbn: '978-1305585126',
    publisher: 'Cengage Learning',
    year: 2021,
    pages: 880,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/principles-of-economics.pdf',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    description: 'Introduction to Algorithms — the definitive reference for computer science students worldwide.',
    price: 15000,
    category: 'academic',
    year: 2022,
    pages: 1292,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/intro-to-algorithms.pdf',
    featured: true,
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    description: 'What the rich teach their kids about money that the poor and middle class do not.',
    price: 5000,
    category: 'business',
    year: 2017,
    pages: 336,
    fileFormat: 'EPUB',
    downloadUrl: 'https://www.example.com/books/rich-dad-poor-dad.epub',
    featured: true,
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    description: 'A classic personal development book outlining 13 principles of success through desire and persistence.',
    price: 4000,
    category: 'business',
    year: 2005,
    pages: 238,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/think-and-grow-rich.pdf',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy and proven way to build good habits and break bad ones through small incremental changes.',
    price: 6500,
    category: 'non-fiction',
    year: 2018,
    pages: 320,
    fileFormat: 'EPUB',
    downloadUrl: 'https://www.example.com/books/atomic-habits.epub',
    featured: true,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'A groundbreaking narrative of humanity\'s creation and evolution from early humans to today.',
    price: 8000,
    category: 'non-fiction',
    year: 2015,
    pages: 443,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/sapiens.pdf',
  },
  {
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
    description: 'A beloved classic picture book about a caterpillar eating through a variety of foods.',
    price: 2000,
    category: 'children',
    year: 1969,
    pages: 32,
    fileFormat: 'PDF',
    downloadUrl: 'https://www.example.com/books/hungry-caterpillar.pdf',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Book.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@bookhaven.com',
      password: 'admin123',
    });
    console.log(`👤 Admin created: ${admin.email} / password: admin123`);

    const user = await User.create({
      name: 'Test User',
      email: 'user@bookhaven.com',
      password: 'user123',
    });
    console.log(`👤 Test user: ${user.email} / password: user123`);

    await Book.insertMany(sampleBooks);
    console.log(`📚 Seeded ${sampleBooks.length} e-books`);

    console.log('\n✅ Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin login:     admin@bookhaven.com / admin123');
    console.log('Test user login: user@bookhaven.com  / user123');
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    mongoose.disconnect();
    process.exit();
  }
};

seed();
