const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('../models/Problem');

const problems = [
  {
    title: 'A. Letter Home',
    description: `You are given an array of distinct integers x1,x2,…,xn and an integer s.\n\nInitially, you are at position pos=s on the X axis. In one step, you can perform exactly one of the following two actions:\n\nMove from position pos to position pos+1.\nMove from position pos to position pos−1.\nA sequence of steps will be considered successful if, during the entire journey, you visit each position xi on the X axis at least once. Note that the initial position pos=s is also considered visited.\n\nYour task is to determine the minimum number of steps in any successful sequence of steps.\n\nInput\nEach test consists of multiple test cases. The first line contains a single integer t (1≤t≤1000) — the number of test cases. The description of the test cases follows.\n\nThe first line of each test case contains two integers n and s (1≤n≤10, 1≤s≤100) — the number of positions to visit and the starting position.\n\nThe second line of each test case contains n integers x1,x2,…,xn (1≤xi≤100). It is guaranteed that for all 1≤i<n, it holds that xi<xi+1.\n\nOutput\nFor each test case, output the minimum number of steps in any successful sequence of steps.`,
    testCases: [
      { input: '1\n1 1\n1', expectedOutput: '0' },
      { input: '1\n1 2\n1', expectedOutput: '1' },
      { input: '1\n1 1\n2', expectedOutput: '1' },
      { input: '1\n2 1\n2 3', expectedOutput: '2' },
      { input: '1\n2 2\n1 3', expectedOutput: '3' },
      { input: '1\n2 3\n1 2', expectedOutput: '2' },
      { input: '1\n3 1\n1 2 3', expectedOutput: '2' },
      { input: '1\n3 2\n1 3 4', expectedOutput: '4' },
      { input: '1\n3 3\n1 2 3', expectedOutput: '2' },
      { input: '1\n4 3\n1 2 3 10', expectedOutput: '11' },
      { input: '1\n5 5\n1 2 3 6 7', expectedOutput: '8' },
      { input: '1\n6 6\n1 2 3 9 10 11', expectedOutput: '15' }
    ]
  },
  {
    title: 'B. Above the Clouds',
    description: `You are given a string s of length n, consisting of lowercase letters of the Latin alphabet. Determine whether there exist three non-empty strings a, b, and c such that:\n\na+b+c=s, meaning the concatenation of strings a, b, and c equals s.\nThe string b is a substring of the string a+c, which is the concatenation of strings a and c.\n\nInput\nEach test consists of multiple test cases. The first line contains a single integer t (1≤t≤104) — the number of test cases. The description of the test cases follows.\n\nThe first line of each test case contains a single integer n (3≤n≤105) — the length of the string s.\n\nThe second line of each test case contains the string s of length n, consisting of lowercase letters of the Latin alphabet.\n\nOutput\nFor each test case, output "Yes" if there exist three non-empty strings a, b, and c that satisfy the conditions, and "No" otherwise.`,
    testCases: [
      { input: '1\n3\naaa', expectedOutput: 'Yes' },
      { input: '1\n3\naba', expectedOutput: 'No' },
      { input: '1\n3\naab', expectedOutput: 'Yes' },
      { input: '1\n4\nabca', expectedOutput: 'No' },
      { input: '1\n4\nabba', expectedOutput: 'Yes' },
      { input: '1\n4\naabb', expectedOutput: 'Yes' },
      { input: '1\n5\nabaca', expectedOutput: 'Yes' },
      { input: '1\n5\nabcda', expectedOutput: 'No' },
      { input: '1\n5\nabcba', expectedOutput: 'Yes' },
      { input: '1\n6\nabcbbf', expectedOutput: 'Yes' },
      { input: '1\n6\nabcdaa', expectedOutput: 'Yes' },
      { input: '1\n3\nabb', expectedOutput: 'Yes' }
    ]
  },
  {
    title: 'C. Those Who Are With Us',
    description: `You are given a matrix of integers with n rows and m columns. The cell at the intersection of the i-th row and the j-th column contains the number aij.\n\nYou can perform the following operation exactly once:\n\nChoose two numbers 1≤r≤n and 1≤c≤m.\nFor all cells (i,j) in the matrix such that i=r or j=c, decrease aij by one.\nYou need to find the minimal possible maximum value in the matrix a after performing exactly one such operation.\n\nInput\nEach test consists of multiple test cases. The first line contains a single integer t (1≤t≤104) — the number of test cases. The description of the test cases follows.\n\nThe first line of each test case contains two integers n and m (1≤n⋅m≤105) — the number of rows and columns in the matrix.\n\nThe next n lines of each test case describe the matrix a. The i-th line contains m integers ai1,ai2,…,aim (1≤aij≤100) — the elements in the i-th row of the matrix.\n\nOutput\nFor each test case, output the minimum maximum value in the matrix a after performing exactly one operation.`,
    testCases: [
      { input: '1\n1 1\n1', expectedOutput: '0' },
      { input: '1\n1 2\n1 2', expectedOutput: '1' },
      { input: '1\n2 1\n2\n1', expectedOutput: '1' },
      { input: '1\n2 2\n4 2\n3 4', expectedOutput: '3' },
      { input: '1\n2 2\n1 2\n3 2', expectedOutput: '2' },
      { input: '1\n3 2\n1 2\n3 2\n1 2', expectedOutput: '4' },
      { input: '1\n4 3\n1 5 1\n3 1 3\n5 5 5\n3 5 1', expectedOutput: '3' },
      { input: '1\n4 4\n1 3 3 2\n2 3 2 2\n1 2 2 1\n3 3 2 3', expectedOutput: '1' },
      { input: '1\n2 2\n2 2\n1 2', expectedOutput: '1' },
      { input: '1\n3 3\n2 1 1\n1 2 1\n1 1 2', expectedOutput: '2' }
    ]
  }
];

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      console.log('Seeder DB Name:', mongoose.connection.name);
      try {
        await Problem.deleteMany({});
        await Problem.insertMany(problems);
        console.log('Problems seeded successfully');
      } catch (error) {
        console.error('Error seeding problems:', error);
      } finally {
        mongoose.connection.close();
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
} 