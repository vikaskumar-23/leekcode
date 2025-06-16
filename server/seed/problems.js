const Problem = require('../models/Problem');

const problems = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.`,
    difficulty: 'Easy'
  },
  {
    title: 'Reverse String',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

Example 1:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Example 2:
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]

Constraints:
- 1 <= s.length <= 105
- s[i] is a printable ascii character.

Follow up: Do not allocate extra space for another array. You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'Easy'
  },
  {
    title: 'Palindrome Number',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same forward and backward.

Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

Example 2:
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

Example 3:
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.

Constraints:
- -231 <= x <= 231 - 1

Follow up: Could you solve it without converting the integer to a string?`,
    difficulty: 'Easy'
  }
];

const seedProblems = async () => {
  try {
    // Clear existing problems
    await Problem.deleteMany({});
    
    // Insert new problems
    await Problem.insertMany(problems);
    
    console.log('Problems seeded successfully');
  } catch (error) {
    console.error('Error seeding problems:', error);
  }
};

module.exports = seedProblems; 