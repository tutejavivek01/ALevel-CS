// The fixed OCR challenge set (design.md §6.8, requirements.md §8.8) -
// all 80 challenges from OCR's "Coding Challenges Booklet" (GCSE/A
// Level Computer Science, v3, ocr.org.uk), transcribed verbatim from
// the source PDF per conventions.md's content-accuracy workflow.
// Fixed, code-reviewed reference content, not parent-authored - the
// database only stores mutable state keyed by `id` (see
// ocr_challenge_submissions etc., design.md §2.2).
//
// `number` is the booklet's own numbering, kept purely for citation -
// it plays no role in `id`, which is a stable slug independent of the
// booklet ever being re-numbered in a future version.
//
// OCR publishes no solutions for any of these ("there are many ways in
// which these problems could be solved"), so `testCases` (added in task
// 34) has to be hand-derived and verified per challenge, not copied from
// an answer key. Its absence here means "not yet given test cases" for
// challenges still pending task 34, or "permanently manual-review-only"
// for challenges design.md §6.8 identified as not auto-gradable (no
// display/network in the execution sandbox, or no single correct
// output) - both look identical to the UI (no "Run" button), which is
// the intended behavior either way.
//
// The booklet contains exactly one diagram (piece-movement images for
// challenge 74, "Checkmate checker"). No PDF image-extraction tool was
// available in the build environment (no pdfimages/pdftoppm/mutool/
// ghostscript - and Windows' own system32/convert.exe is unrelated to
// ImageMagick's convert, a common false positive), so rather than skip
// or fake the diagram, standard chess piece movement is spelled out as
// text in that challenge's own description instead - unambiguous, and
// actually more usable for writing test cases than a cropped image
// would have been. `imageUrl` therefore stays unused throughout this
// file; the field exists on the type for any future challenge/version
// that does need one.
export type OcrChallenge = {
  id: string;
  number: number;
  title: string;
  description: string;
  extensions?: string[];
  imageUrl?: string;
  testCases?: { input: string; expectedOutput: string }[];
  starterCode?: string;
};

export const OCR_CHALLENGES: OcrChallenge[] = [
  {
    id: 'ocr-factorial-finder',
    number: 1,
    title: 'Factorial Finder',
    description: `The Factorial of a positive integer, n, is defined as the product of the sequence n, n-1, n-2, ...1 and the factorial of zero, 0, is defined as being 1. Solve this using both loops and recursion.`,
  },
  {
    id: 'ocr-speed-tracker',
    number: 2,
    title: 'Speed Tracker',
    description: `Create a program that takes a time for a car going past a speed camera, the time going past the next one and the distance between them to calculate the average speed for the car in mph. The cameras are one mile apart.`,
    extensions: [
      `Speed cameras know the timings of each car going past, through number plate recognition. Valid number plates are two letters, two numbers and three letters afterwards, for example XX77 787. Produce a part of the program that checks whether a number plate matches the given pattern. Tell the user either way.`,
      `Create a program for creating a file of details for vehicles exceeding the speed limit set for a section of road. You will need to create a suitable file with test data, including randomised number plates and times. You will then use the code you've already written to process this list to determine who is breaking the speed limit (70mph) and who has invalid number plates.`,
    ],
  },
  {
    id: 'ocr-thief',
    number: 3,
    title: 'Thief!',
    description: `A thief has managed to find out the four digits for an online PIN code, but doesn't know the correct sequence needed to hack into the account.

Design and write a program that displays all the possible combinations for any four numerical digits entered by the user. The program should avoid displaying the same combination more than once.

Submit a fully detailed Showcase for your program.`,
  },
  {
    id: 'ocr-classification',
    number: 4,
    title: 'Classification',
    description: `A simple classification system asks a series of Yes/No questions in order to work out what type of animal is being looked at.

Eg Does it have 4 legs? Does it eat meat? Does it have stripes?

These systems can often be drawn using a "tree" structure. Carry out some simple research on classification trees, then write a program to help the user decide between the following:

horse, cow, sheep, pig, dog, cat, lion, tiger, whale, dolphin, seal, penguin, ostrich, sparrow, spider, ant, bee, wasp, termite, octopus, squid

Is there a better way to do this than using 101 IF...ELSE...END IFs?

Develop your classification system for your own area of interest: pop bands; pokemon; cars; footballers; teachers; diseases etc.`,
  },
  {
    id: 'ocr-fruit-machine',
    number: 5,
    title: 'Fruit Machine',
    description: `Write a program to simulate a Fruit Machine that displays three symbols at random from Cherry, Bell, Lemon, Orange, Star, Skull.

The player starts with £1 credit, with each go costing 20p. If the Fruit Machine "rolls" two of the same symbol, the user wins 50p. The player wins £1 for three of the same and £5 for 3 Bells. The player loses £1 if two skulls are rolled and all of his/her money if three skulls are rolled. The player can choose to quit with the winnings after each roll or keep playing until there is no money left.`,
  },
  {
    id: 'ocr-unit-converter',
    number: 6,
    title: 'Unit Converter (temperature, currency, volume)',
    description: `Converts various units between one another. The user enters the type of unit being entered, the type of unit they want to convert to and then the value. The program will then make the conversion.`,
  },
  {
    id: 'ocr-credit-card-validator',
    number: 7,
    title: 'Credit Card Validator',
    description: `Takes in a credit card number from a common credit card vendor (Visa, MasterCard, American Express, Discoverer) and validates it to make sure that it is a valid number (look into how credit cards use a checksum).`,
  },
  {
    id: 'ocr-arithmetic-test',
    number: 8,
    title: 'Arithmetic test',
    description: `A primary school teacher wants a computer program to test the basic arithmetic skills of her students. Generate random questions (2 numbers only) consisting of addition, subtraction, multiplication and division.

The system should ask the student's name and then ask ten questions. The program should feed back if the answers are correct or not, and then generate a final score at the end.`,
    extensions: [
      `Extend your program so that it stores the results somewhere. The teacher has three classes, so you need to enable the program to distinguish between them.`,
      `The teacher wants to be able to log student performance in these tests. The teacher would like the program to store the last three scores for each student and to be able to output the results in alphabetical order with the student's highest score first out of the three.`,
    ],
  },
  {
    id: 'ocr-happy-numbers',
    number: 9,
    title: 'Happy Numbers',
    description: `A happy number is defined by the following process:

Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1. Those numbers for which this process ends in 1 are happy numbers, while those that do not end in 1 are unhappy numbers. Display an example of your output here. Find the first eight happy numbers.`,
  },
  {
    id: 'ocr-number-names',
    number: 10,
    title: 'Number Names',
    description: `Show how to spell out a number in English. You can use a pre-existing implementation or make your own, but you should support inputs up to at least one million (or the maximum value of your language's default bounded integer type, if that's less).`,
    extensions: [
      `Create support for inputs other than positive integers (like zero, negative integers, and floating-point numbers).`,
    ],
  },
  {
    id: 'ocr-regex-query-tool',
    number: 11,
    title: 'Regex Query Tool',
    description: `This is a tool that allows the user to enter a text string and then in a separate text box enter a regex pattern. It will run the regular expression against the string and return any matches or flag errors in the regular expression.`,
  },
  {
    id: 'ocr-quiz-maker',
    number: 12,
    title: 'Quiz Maker',
    description: `Make an application which takes various questions from a file, picked randomly, and puts together a quiz for students. Each quiz can be different and then reads a key to grade the quizzes.`,
  },
  {
    id: 'ocr-caesar-cipher',
    number: 13,
    title: 'Caesar Cipher',
    description: `Implement a Caesar cipher, both encoding and decoding. The key is an integer from 1 to 25. This cipher rotates the letters of the alphabet (A to Z). The encoding replaces each letter with the 1st to 25th next letter in the alphabet (wrapping Z to A). So key 2 encrypts "HI" to "JK", but key 20 encrypts "HI" to "BC".`,
  },
  {
    id: 'ocr-events-calendar',
    number: 14,
    title: 'Events calendar',
    description: `Create a menu driven program that allows the user to add or delete events from a list of dates and timings, just like a calendar. The program should warn you if any of the events overlap when entering them.`,
    extensions: [
      `Make it so that none of the events are hard-coded into the program`,
    ],
  },
  {
    id: 'ocr-pangrams',
    number: 15,
    title: 'Pangrams',
    description: `"The quick brown fox jumps over the lazy dog"; note how all 26 English-language letters are used in the sentence.

Your goal is to implement a program that takes a series of strings (one per line) and prints either True (the given string is a pangram), or False if it is not.`,
  },
  {
    id: 'ocr-kaprekar',
    number: 16,
    title: 'Kaprekar',
    description: `Determine whether a number is a Kaprekar number or not. See http://mathworld.wolfram.com/KaprekarNumber.html for more information.`,
  },
  {
    id: 'ocr-number-table',
    number: 17,
    title: 'Number Table',
    description: `Write a program that takes a symbol (+,-,* or /) and a natural number (>0) and makes a table like below for the operation from 0 to n

For this example the user has entered "+ 4":

+|01234
-------------------
0|01234
1|12345
2|23456
3|34567
4|45678`,
  },
  {
    id: 'ocr-years-in-a-range',
    number: 18,
    title: 'Years in a Range',
    description: `Write a program to count the number years in a range that has a repeated digit.

For example, 2012 has a repeated digit, but 2013 does not.`,
  },
  {
    id: 'ocr-logic-gate',
    number: 19,
    title: 'Logic Gate',
    description: `Write a program that will give the students the answer to logic gate questions

For example:

Enter logic gate : OR
Enter first input : 1
Enter second input : 0
Result = 1

It should work for the logic gates OR, AND, XOR, NAND and NOR`,
  },
  {
    id: 'ocr-palindromes',
    number: 20,
    title: 'Palindromes',
    description: `Write a program that checks if a string entered by the user is a palindrome. A palindrome is a word that reads the same forwards as backwards like "racecar"`,
  },
  {
    id: 'ocr-data-entry',
    number: 21,
    title: 'Data Entry',
    description: `Create a program that retrieves the membership details for a Rock Climbing Club. The program should take a range of details and then repeat them back, with headings, for confirmation. Once confirmed, the program stores these details; else it clears them and allows a new input.`,
    extensions: [
      `Allow entry of more than one membership`,
      `Store membership details to a file`,
      `Retrieve details from a file`,
      `Allow searching for stored users`,
    ],
  },
  {
    id: 'ocr-simple-life-calculator',
    number: 22,
    title: 'Simple Life Calculator',
    description: `Create a program that has 3 simple calculators within it, e.g. VAT, Tax and Times table. Allow users to choose which calculator they want to use and then carry out that calculation.`,
    extensions: [
      `Use a an option menu so that the user can use more than one calculation before the program closes`,
    ],
  },
  {
    id: 'ocr-fibbing',
    number: 23,
    title: 'Fibbing',
    description: `Create a program that will calculate the Fibonacci Sequence to 10 places.`,
    extensions: [
      `Allow the user to specify the number of places generated`,
      `Print this in reverse order`,
      `Display the total of all the numbers shown`,
    ],
  },
  {
    id: 'ocr-hack-proof',
    number: 24,
    title: 'Hack-proof',
    description: `Create a program that will only open a text document if the correct password is entered. The user should choose the username and password first and it should also verify the password before allowing it.`,
    extensions: [
      `Create a random password first of at least 8 characters first as a suggested password`,
      `Create a random password that contains at least a lowercase, uppercase and special character of at least 8 characters in length`,
      `Verify that the password given by the user matches: a. The limits in Extension 1 above; b. The limits in Extension 2 above`,
    ],
  },
  {
    id: 'ocr-ordering',
    number: 25,
    title: 'Ordering',
    description: `Create a program that allows entry of 10 numbers and then sorts them into ascending or descending order, based on user input.`,
    extensions: [
      `The user can input a word or string, and it arranges the string into alphabetical order. E.g. My Rabbit would be shown as "abbimty ". (Punctuation placement is not essential)`,
      `Repeat Extension 1, but include the sentence structure`,
    ],
  },
  {
    id: 'ocr-truth-or-not',
    number: 26,
    title: 'Truth or not!',
    description: `Create a program that would take the number of inputs in a logic circuit and works out the number of output lines are needed for the truth table. Have it draw the truth table on screen, using Columns for Inputs (A, B, C etc) and rows for the 1's and 0's.`,
    extensions: [`Fill in the rest of the truth table if you can!`],
  },
  {
    id: 'ocr-word-subtraction',
    number: 27,
    title: 'Word Subtraction',
    description: `Create a program that takes two strings/words. Then converts this to an ASCII value and subtracts the values from each other.`,
    extensions: [
      `Also add a function that removes any characters in the second word that occur in the first word. E.g. Fish and Tin, would return "Fsh" and "Tn"`,
    ],
  },
  {
    id: 'ocr-name-that-number',
    number: 28,
    title: 'Name that Number',
    description: `Telephone Keypads often have letters associated with each number. This means that 0141 117 2556 could be stored as 0141-CAT-DOOR. Create a program that can convert a phone number with "letters" into one that only contains digits.`,
    extensions: [
      `Can you develop your program so that only words in the dictionary are allowed?`,
    ],
  },
  {
    id: 'ocr-item-merge',
    number: 29,
    title: 'Item Merge',
    description: `Create a program that will compare two shopping lists from "Week A" and "Week B". It will return any unique items contained on the list.`,
    extensions: [
      `Append the two lists, with no repetition`,
      `Develop this to 4 Weeks of shopping and highlight the top 3 most popular items`,
    ],
  },
  {
    id: 'ocr-year-addition',
    number: 30,
    title: 'Year Addition',
    description: `Create a program that accepts a year in the format ####, e.g. 2015. The program then adds each digit of the year together and outputs the answer. E.g. 2015 becomes the output 8.`,
    extensions: [
      `Develop this so that the user can guess an integer value. If the MOD division is "0" they score a point, if it isn't they can guess again, up to 3 attempts in total`,
    ],
  },
  {
    id: 'ocr-forwards-and-backwards',
    number: 31,
    title: 'Forwards and Backwards',
    description: `Create a program that is able to detect if an input is the same as the reverse of the same input - i.e. a Palindrome`,
  },
  {
    id: 'ocr-code-it-up',
    number: 32,
    title: 'Code it up',
    description: `Create a program that adds 25 to the value of each character of a string that a user enters. This new string should be saved and output.`,
    extensions: [
      `Develop your program to include a conversion from a 'coded' string back to a normal string`,
      `Develop your program to allow the user to enter the number they want the string coded by (e.g. 12)`,
      `Develop your program to then decode a string, based on the coded value that the end user enters`,
    ],
  },
  {
    id: 'ocr-mor-se-coding',
    number: 33,
    title: 'Mor-se Coding',
    description: `Create a program that allows you to enter a string and encode it into Morse code, using a dot and dash notation. Spaces between words should be replaced with the "|" (pipe) character. Use a normal space for gaps between each character.`,
    extensions: [
      `Develop your program to translate from Morse to alphanumeric, using the standards above`,
    ],
  },
  {
    id: 'ocr-whats-the-day',
    number: 34,
    title: "What's the day?",
    description: `Design a program to take 3 inputs, one for day, one for month and one for year. Get your program to validate if this is an actual day, and, if it is, output the day of the week it is!

Hint: How do leap years affect this program?`,
  },
  {
    id: 'ocr-game-of-chance',
    number: 35,
    title: 'Game of Chance',
    description: `A user can bet on any number from 0 to 30. If it's an even number they 2x their money back. If it's a multiple of 10 they get 3x their money back. If it's a prime number they get 5x their money back. If the number is below 5 they get a 2x bonus.

Create a program that allows the user to guess a number. A random number is generated. If the guess == the random number then the user wins and gets a pay-out. Combinations of the win scenarios should be catered for.. e.g. 20 wins 2 x 3 bonus = 6x their money.`,
    extensions: [
      `Develop your program to allow a user to enter the amount they want to place for that bet, and work out the resulting pay-out`,
      `Develop your program to store the user's current balance and stop them from betting if they have no money left`,
      `Develop your program to finally incorporate validation so that they cannot enter into a negative amount of cash ever, and that a bet should be between 1 and 10 units of currency`,
      `Develop your program to allow multiple bets on different numbers`,
    ],
  },
  {
    id: 'ocr-triangulate',
    number: 36,
    title: 'Triangulate',
    description: `Create a program that accepts 3 sides of a triangle. It then works out if these sides form a triangle, and if so, what type of triangle (e.g. Scalene, Isosceles, Right-Angle....)`,
    extensions: [
      `Develop your program to allow 2 sides of a triangle and an angle, to work out the length of the missing side`,
    ],
  },
  {
    id: 'ocr-fizz-buzz',
    number: 37,
    title: 'Fizz Buzz',
    description: `Create a program that replicates the famous game Fizz Buzz. The program will take an input, e.g. 20, and then print out the list of Fizz Buzz up to and including that number, where:

- Any multiple of 3 is replaced by the word 'Fizz'
- Any multiple of 5 is replaced by the word 'Buzz'
- Any multiple of both 3 and 5 is replaced by the word 'FizzBuzz'`,
    extensions: [
      `Replace any prime number with the word 'OOPS!'`,
      `Allow the user to enter the base numbers that they want to replace words with. E.g. 2 and 3, which would mean: any multiple of 2 is replaced by the word 'Fizz'; any multiple of 3 is replaced by the word 'Buzz'; any multiple of both 2 and 3 is replaced by the word 'FizzBuzz'`,
    ],
  },
  {
    id: 'ocr-sing-along',
    number: 38,
    title: 'Sing Along',
    description: `Create a program that prints the lyrics to the song '10 green bottles' in as few lines of code as possible.`,
    extensions: [
      `Develop this program so that you can enter any starting number and it will count down from there`,
    ],
  },
  {
    id: 'ocr-even-more-odd',
    number: 39,
    title: 'Even more Odd',
    description: `Create a program that accepts an array of at least 10 integers and orders them firstly by size, (small to large), and then puts all the even numbers AFTER the odd numbers within the array. It then echos the original array and the modified array to screen. E.g. an array 1,2,3,4,5,6,7,8,9,10 would be output 1,3,5,7,9,2,4,6,8,10.`,
    extensions: [
      `Develop your program to allow Character input as well, and these come before the integers, and are listed in reverse alphabetical order`,
    ],
  },
  {
    id: 'ocr-base-of-numbers',
    number: 40,
    title: 'Base of Numbers',
    description: `Create a program that converts a denary number into its hexadecimal equivalent.`,
    extensions: [
      `Allow the user to specify the base that they want to convert the number into, using an integer, e.g. 16 for Hexadecimal`,
    ],
  },
  {
    id: 'ocr-prime-factorisation',
    number: 41,
    title: 'Prime Factorisation',
    description: `Have the user enter a number and find all Prime Factors (if there are any) and display them.`,
    extensions: [
      `Have the program find prime numbers until the user chooses to stop asking for the next one.`,
    ],
  },
  {
    id: 'ocr-tilers-mate',
    number: 42,
    title: 'Tilers mate',
    description: `Have the user enter the Width and Length of the floor and have the program calculate the total cost of tiles it would take to cover a floor plan using a cost entered by the user (per tile or metre2).`,
    extensions: [
      `Have the programme offer different types of tiles with different costs and tell the user the cost.`,
      `Have the programme take into account the cost of grout and labour to give a customer a quote with and without VAT.`,
    ],
  },
  {
    id: 'ocr-the-meaning-of-life',
    number: 43,
    title: 'The meaning of life',
    description: `Have the program make an animation of the game of life (https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).`,
    extensions: [
      `Let the user set up the initial state`,
      `Let the user change cells while the animation is running`,
    ],
  },
  {
    id: 'ocr-sudoku',
    number: 44,
    title: 'Sudoku',
    description: `Have the program solve a Sudoku (https://en.wikipedia.org/wiki/Sudoku).`,
  },
  {
    id: 'ocr-find-the-factorial',
    number: 45,
    title: 'Find the factorial',
    description: `The Factorial of a positive integer, n, is defined as the product of the sequence n, n-1, n-2, ...1 and the factorial of zero, 0, is defined as being 1. Solve this using both loops and recursion.`,
  },
  {
    id: 'ocr-complex-numbers',
    number: 46,
    title: 'Complex Numbers',
    description: `Have the programme show addition, multiplication, negation, and inversion of complex numbers in separate functions. (Subtraction and division operations can be made with pairs of these operations.) Print the results for each operation tested to screen.`,
  },
  {
    id: 'ocr-happy-numbers-47',
    number: 47,
    title: 'Happy Numbers =)',
    description: `A happy number is defined by the following process. Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1. Those numbers for which this process ends in 1 are happy numbers, while those that do not end in 1 are unhappy numbers. Have the programme find the first 8 happy numbers.`,
  },
  {
    id: 'ocr-reverse-it',
    number: 48,
    title: 'Reverse it',
    description: `Have the programme allow a user to enter some text and then the programme will reverse it and print it back to the screen.`,
    extensions: [
      `Have the programme count the vowels and consonants and print these to screen.`,
      `Have the programme check if the text is a palindrome (it is the same forwards as it is backwards e.g "racecar" or "hannah").`,
    ],
  },
  {
    id: 'ocr-fireworks',
    number: 49,
    title: 'Fireworks',
    description: `Make an animation of a firework display, with rockets, Catherine wheels etc.`,
    extensions: [
      `Let the user specify the number, colour, timing and location of fireworks.`,
    ],
  },
  {
    id: 'ocr-mandelbrot-set',
    number: 50,
    title: 'Mandelbrot Set',
    description: `Draw a Mandelbrot set (http://mathworld.wolfram.com/MandelbrotSet.html).`,
    extensions: [`In colour`, `With an animation`, `Allow the user to zoom in`],
  },
  {
    id: 'ocr-text-speak-converter',
    number: 51,
    title: 'Text-speak converter',
    description: `Set up a text-speak to English dictionary and have the program convert input from text-speak to English. ("lol" to "laugh out loud" etc)`,
    extensions: [
      `Read in the text from a file`,
      `Allow the user to add new entries in the dictionary`,
    ],
  },
  {
    id: 'ocr-is-this-card-valid',
    number: 52,
    title: 'Is this card valid?',
    description: `Have the programme take in a credit card number from a common credit card vendor (Visa, MasterCard, American Express, Discoverer) and validates it to make sure that it is a valid number (look into how credit cards use a checksum).

***Don't use any real card details***`,
  },
  {
    id: 'ocr-mortgage-calculator',
    number: 53,
    title: 'Mortgage Calculator',
    description: `Have the programme calculate the monthly payments of a fixed term mortgage over given Nth terms at a given interest rate. Also figure out how long it will take the user to pay back the loan.`,
    extensions: [
      `Add an option for users to select the compounding interval (Monthly, Weekly, Daily, Continually).`,
      `Add in functionality to deal with over payments at a given % each month.`,
    ],
  },
  {
    id: 'ocr-dear-diary',
    number: 54,
    title: 'Dear Diary',
    description: `Have the programme allow people to add comments or write diary entries. It should add timestamps to all entries. Could also be made into a shout box (https://en.wikipedia.org/wiki/Shoutbox).`,
    extensions: [
      `Add date stamps to each post.`,
      `Embed your programme in a webpage.`,
      `Have the programme save the diary entries externally.`,
    ],
  },
  {
    id: 'ocr-secret-ciphers',
    number: 55,
    title: 'Secret Ciphers',
    description: `Have the programme encrypt messages using one of the following ciphers: Vigenere, Vernan, Caesar. The cipher can ignore numbers, symbols and whitespace.`,
    extensions: [
      `Create separate functions for each Cipher and allow the user to choose which one to use.`,
      `Have the programme decrypt messages also.`,
      `Have the programme email the encrypted message to a friend.`,
    ],
  },
  {
    id: 'ocr-page-scraper',
    number: 56,
    title: 'Page Scraper',
    description: `Have the programme connect to a site and pull out all the links, or images, and save them to a list.`,
    extensions: [
      `Organize the indexed content and don't allow duplicates.`,
      `Have it put the results into an easily searchable index file.`,
    ],
  },
  {
    id: 'ocr-such-meme-many-like',
    number: 57,
    title: 'Such meme, many like',
    description: `Have the programme display a blank meme template (https://imgflip.com/memetemplates) and allow the user to add their own text (don't forget to use Impact as the font).`,
    extensions: [
      `Display the finished memes in a webpage`,
      `Have suggestions about the different memes on how to write them properly`,
    ],
  },
  {
    id: 'ocr-text-based-game',
    number: 58,
    title: 'Text based game',
    description: `Create a text based game like Zork. Have the programme take the users name and use it to tell the story. Have the programme allow a non-linear progression through the various rooms. The user should have at least 2 choices per room. You will want to plan this one with a flowchart first!`,
    extensions: [
      `Have each room as a separate function.`,
      `Add an inventory system so you must collect a key to get through a certain door etc.`,
    ],
  },
  {
    id: 'ocr-csv-file-utility',
    number: 59,
    title: 'CSV File Utility',
    description: `Have the programme read a .CSV file of records, sort them, and then write them back to the file. Allow the user to choose various sorting algorithms based on a chosen field.`,
  },
  {
    id: 'ocr-get-gify-with-it',
    number: 60,
    title: 'Get GIFy with it',
    description: `Have the programme convert small video files into GIFs. Have a look at a tutorial on making animated GIFs from video files with Python for inspiration.`,
    extensions: [
      `Crop the video`,
      `Freeze a region`,
      `Make your GIF time symmetrical`,
      `Add some text`,
      `Remove the background`,
    ],
  },
  {
    id: 'ocr-your-name-is',
    number: 61,
    title: 'Your name is...',
    description: `Have the programme ask for your name, age and form. Have it tell them the information back in the format: Your name is (blank), you are (blank) years old, and you are in form (blank).`,
    extensions: [
      `Have the programme store this information in an external file`,
    ],
  },
  {
    id: 'ocr-random-password-generator',
    number: 62,
    title: 'R@nd0m P@ssw0rd generator',
    description: `Have the programme create random strong passwords mixing upper and lower case, symbols and numbers.`,
    extensions: [
      `Have the password also use ASCII characters`,
      `Have the passwords stored in an external file`,
    ],
  },
  {
    id: 'ocr-i-like-pi',
    number: 63,
    title: 'I like Pi',
    description: `Have the programme calculate pi to at least 30 decimal places.`,
  },
  {
    id: 'ocr-galaxy-song',
    number: 64,
    title: 'Galaxy song',
    description: `Use graphics and random functions to draw an imaginary night sky filled with stars.`,
    extensions: [`Add the milky way`],
  },
  {
    id: 'ocr-spam-filter',
    number: 65,
    title: 'Spam filter',
    description: `Take a list of dishes from a menu and add "spam" to them (see the Monty Python "Spam" sketch).`,
    extensions: [
      `Experiment with adding spam at the beginning, end and all places in-between`,
    ],
  },
  {
    id: 'ocr-silly-walks',
    number: 66,
    title: 'Silly walks',
    description: `Draw a random walk where each step of equal length is either up, down, right or left with equal probability (see https://en.wikipedia.org/wiki/Random_walk).`,
    extensions: [
      `Model Brownian motion (https://en.wikipedia.org/wiki/Brownian_motion) in 2 dimensions with several particles`,
      `Fill your screen with a space filling curve`,
    ],
  },
  {
    id: 'ocr-what-have-the-romans-ever-done-for-us',
    number: 67,
    title: 'What have the Romans ever done for us?',
    description: `Have the user enter a number and print it out in Roman numerals.`,
  },
  {
    id: 'ocr-semaphore',
    number: 68,
    title: 'Semaphore',
    description: `Have the user enter some text and make an animation of it converted into semaphore (https://en.wikipedia.org/wiki/Flag_semaphore).`,
  },
  {
    id: 'ocr-beautiful-soup',
    number: 69,
    title: 'Beautiful soup',
    description: `Use the BeautifulSoup and requests Python packages to print out a list of all the article titles on the BBC News (http://www.bbc.co.uk/news).`,
  },
  {
    id: 'ocr-of-mice-and-men',
    number: 70,
    title: 'Of mice and men',
    description: `Have the programme allow a user to play the "mice and men" game. The game works like this:

Randomly generate a 4-digit number. Ask the user to guess a 4-digit number. For every digit that the user guessed correctly in the correct place, they have a "mouse". For every digit the user guessed correctly in the wrong place is a "man". Every time the user makes a guess, tell them how many "mice" and "men" they have.

Once the user guesses the correct number, the game is over. Keep track of the number of guesses the user makes throughout the game and tell the user at the end.`,
    extensions: [`Deal with "mice" and "mouse" and "man" and "men" properly.`],
  },
  {
    id: 'ocr-goldbach',
    number: 71,
    title: 'Goldbach',
    description: `Goldbach's conjecture says that every positive even number greater than 2 is the sum of two prime numbers. Example: 28 = 5 + 23. It is one of the most famous facts in number theory that has not been proved to be correct in the general case. It has been numerically confirmed up to very large numbers.

Write a predicate to find the two prime numbers that sum up to a given even integer.`,
  },
  {
    id: 'ocr-lists',
    number: 72,
    title: 'Lists',
    description: `Create a list containing all integers within a given range. Insert an element at a given position into a list. Extract a given number of randomly selected elements from a list and create a list of lists. Sort the list of lists according to the length of sublists.`,
  },
  {
    id: 'ocr-travel-club',
    number: 73,
    title: 'Travel club',
    description: `A group of people are members of a travel club. The group shares expenses equally but it is not practical to share every expense as they happen, so all expenses are collated (such as taxis, train tickets etc) after the trip and the member cost is shared to within 1% between the group.

Create a programme that computes the net cost from a list of expenses and works out the minimum amount of money that must change hands in order for everybody to have paid the same amount (within 1%).`,
  },
  {
    id: 'ocr-checkmate-checker',
    number: 74,
    title: 'Checkmate checker',
    description: `Create a programme that checks whether a King is in check in a given chess game configuration.

Standard chess piece movement (the booklet illustrates this with a diagram; described here in text instead, since no image-extraction tool was available to faithfully reproduce it - see this file's header comment):
- Pawn: moves forward one square (two from its starting square), and captures one square diagonally forward.
- Rook (the booklet's "Castle"): moves any number of squares horizontally or vertically.
- Bishop: moves any number of squares diagonally.
- Queen: moves any number of squares horizontally, vertically, or diagonally.
- King: moves exactly one square in any direction.
- Knight: moves in an "L" shape - two squares in one direction (horizontal or vertical) then one square perpendicular to that.

There will be an arbitrary number of board configurations in the input, each consisting of eight lines of eight characters each. A "." denotes an empty square, while upper- and lowercase letters represent the pieces as defined above (uppercase for one side, lowercase for the other). There will be no invalid characters and no configurations where both kings are in check. You must read until you find an empty board consisting only of "." characters, which should not be processed. There will be an empty line between each pair of board configurations. All boards, except for the empty one, will contain exactly one white king and one black king.

For each board configuration read you must output one of the following answers:

Game #d: white king is in check.
Game #d: black king is in check.
Game #d: no king is in check.

where d stands for the game number starting from 1.`,
  },
  {
    id: 'ocr-string-permutation',
    number: 75,
    title: 'String permutation',
    description: `Given two strings x and y, print the longest string a of letters such that there is a permutation of a that is a subsequence of x and there is a permutation of a that is a subsequence of y.`,
  },
  {
    id: 'ocr-thats-a-lot-of-number',
    number: 76,
    title: "That's a lot of number",
    description: `Work out the first ten digits of the sum of the following one-hundred 50-digit numbers.

37107287533902102798797998220837590246510135740250
46376937677490009712648124896970078050417018260538
74324986199524741059474233309513058123726617309629
91942213363574161572522430563301811072406154908250
23067588207539346171171980310421047513778063246676
89261670696623633820136378418383684178734361726757
28112879812849979408065481931592621691275889832738
44274228917432520321923589422876796487670272189318
47451445736001306439091167216856844588711603153276
70386486105843025439939619828917593665686757934951
62176457141856560629502157223196586755079324193331
64906352462741904929101432445813822663347944758178
92575867718337217661963751590579239728245598838407
58203565325359399008402633568948830189458628227828
80181199384826282014278194139940567587151170094390
35398664372827112653829987240784473053190104293586
86515506006295864861532075273371959191420517255829
71693888707715466499115593487603532921714970056938
54370070576826684624621495650076471787294438377604
53282654108756828443191190634694037855217779295145
36123272525000296071075082563815656710885258350721
45876576172410976447339110607218265236877223636045
17423706905851860660448207621209813287860733969412
81142660418086830619328460811191061556940512689692
51934325451728388641918047049293215058642563049483
62467221648435076201727918039944693004732956340691
15732444386908125794514089057706229429197107928209
55037687525678773091862540744969844508330393682126
18336384825330154686196124348767681297534375946515
80386287592878490201521685554828717201219257766954
78182833757993103614740356856449095527097864797581
16726320100436897842553539920931837441497806860984
48403098129077791799088218795327364475675590848030
87086987551392711854517078544161852424320693150332
59959406895756536782107074926966537676326235447210
69793950679652694742597709739166693763042633987085
41052684708299085211399427365734116182760315001271
65378607361501080857009149939512557028198746004375
35829035317434717326932123578154982629742552737307
94953759765105305946966067683156574377167401875275
88902802571733229619176668713819931811048770190271
25267680276078003013678680992525463401061632866526
36270218540497705585629946580636237993140746255962
24074486908231174977792365466257246923322810917141
91430288197103288597806669760892938638285025333403
34413065578016127815921815005561868836468420090470
23053081172816430487623791969842487255036638784583
11487696932154902810424020138335124462181441773470
63783299490636259666498587618221225225512486764533
67720186971698544312419572409913959008952310058822
95548255300263520781532296796249481641953868218774
76085327132285723110424803456124867697064507995236
37774242535411291684276865538926205024910326572967
23701913275725675285653248258265463092207058596522
29798860272258331913126375147341994889534765745501
18495701454879288984856827726077713721403798879715
38298203783031473527721580348144513491373226651381
34829543829199918180278916522431027392251122869539
40957953066405232632538044100059654939159879593635
29746152185502371307642255121183693803580388584903
41698116222072977186158236678424689157993532961922
62467957194401269043877107275048102390895523597457
23189706772547915061505504953922979530901129967519
86188088225875314529584099251203829009407770775672
11306739708304724483816533873502340845647058077308
82959174767140363198008187129011875491310547126581
97623331044818386269515456334926366572897563400500
42846280183517070527831839425882145521227251250327
55121603546981200581762165212827652751691296897789
32238195734329339946437501907836945765883352399886
75506164965184775180738168837861091527357929701337
62177842752192623401942399639168044983993173312731
32924185707147349566916674687634660915035914677504
99518671430235219628894890102423325116913619626622
73267460800591547471830798392868535206946944540724
76841822524674417161514036427982273348055556214818
97142617910342598647204516893989422179826088076852
87783646182799346313767754307809363333018982642090
10848802521674670883215120185883543223812876952786
71329612474782464538636993009049310363619763878039
62184073572399794223406235393808339651327408011116
66627891981488087797941876876144230030984490851411
60661826293682836764744779239180335110989069790714
85786944089552990653640447425576083659976645795096
66024396409905389607120198219976047599490197230297
64913982680032973156037120041377903785566085089252
16730939319872750275468906903707539413042652315011
94809377245048795150954100921645863754710598436791
78639167021187492431995700641917969777599028300699
15368713711936614952811305876380278410754449733078
40789923115535562561142322423255033685442488917353
44889911501440648020369068063960672322193204149535
41503128880339536053299340368006977710650566631954
81234880673210146739058568557934581403627822703280
82616570773948327592232845941706525094512325230608
22918802058777319719839450180888072429661980811197
77158542502016545090413245809786882778948721859617
72107838435069186155435662884062257473692284509516
20849603980134001723930671666823555245252804609722
53503534226472524250874054075591789781264330331690`,
  },
  {
    id: 'ocr-fib-on-a-chi',
    number: 77,
    title: 'Fib on a chi',
    description: `The Fibonacci sequence is defined by the recurrence relation:

Fn = Fn-1 + Fn-2, where F1 = 1 and F2 = 1.

Hence the first 12 terms will be: F1=1, F2=1, F3=2, F4=3, F5=5, F6=8, F7=13, F8=21, F9=34, F10=55, F11=89, F12=144.

The 12th term, F12, is the first term to contain three digits.

What is the index of the first term in the Fibonacci sequence to contain 1000 digits?`,
  },
  {
    id: 'ocr-2-fiddy',
    number: 78,
    title: '2 fiddy',
    description: `It is possible to make £2.50 in the following way: 1x£1 + 2x50p + 2x20p + 1x5p + 1x2p + 3x1p.

Write a programme that works out all the different ways £2.50 can be made using any number of coins, from the standard UK coin denominations: £2, £1, 50p, 20p, 10p, 5p, 2p, 1p.`,
  },
  {
    // The source PDF's text for this challenge ends with the scenario
    // below and states no explicit question or deliverable - transcribed
    // exactly as given, not paraphrased or completed with an invented
    // task, per conventions.md's content-accuracy workflow ("not
    // paraphrased from memory"). Left out of task 34's auto-gradable set
    // for this reason: there's nothing to derive a definite expected
    // output from.
    id: 'ocr-printer-problems',
    number: 79,
    title: 'Printer problems',
    description: `A printing shop runs 16 batches (jobs) every week and each batch requires a sheet of special colour-proofing paper of size A5.

Every Monday morning, the foreman opens a new envelope, containing a large sheet of the special paper with size A1. He proceeds to cut it in half, thus getting two sheets of size A2. Then he cuts one of them in half to get two sheets of size A3 and so on until he obtains the A5-size sheet needed for the first batch of the week. All the unused sheets are placed back in the envelope.

At the beginning of each subsequent batch, he takes from the envelope one sheet of paper at random. If it is of size A5, he uses it. If it is larger, he repeats the 'cut-in-half' procedure until he has what he needs and any remaining sheets are always placed back in the envelope.`,
  },
  {
    id: 'ocr-happy-hopper',
    number: 80,
    title: 'Happy Hopper',
    description: `A sequence of n > 0 integers is called a happy hopper if the absolute values of the differences between successive elements take on all possible values 1 through n - 1. E.g. 1 4 2 3 is a happy hopper because the absolute differences are 3, 2, and 1, respectively. The definition implies that any sequence of a single integer is a happy hopper.

Write a program to determine whether each of a number of sequences is a happy hopper.`,
  },
];
