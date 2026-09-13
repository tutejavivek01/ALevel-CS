---
chapter: 14
title: "Bits, bytes and binary"
section: 3
section_title: "Data representation"
spec_area: "4.5"
spec_area_title: "Fundamentals of data representation"
level: "AS / A Level (Year 12)"
pdf_pages: "81-86"
figures: 0
source: "AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0"
---

# Chapter 14 — Bits, bytes and binary
## Objectives

- Define a bit as a 1 or a 0, and a byte as a group of eight bits
- Know that 2° different values can be represented with n bits
« Use names, symbols and corresponding powers of 2 for binary prefixes e.g. Ki, Mi, Gi, Ti © Differentiate between the character code of a decimal digit and its pure binary representation

- Describe ASCII and Unicode coding systems and explain why Unicode was introduced Describe methods used for error-checking and correction

## Bits and bytes

A bit is the fundamental unit of information in the form of either a single 1 or 0. 1 and O are used to represent the two electronic states: on and off, or more accurately a switch that is closed (to complete a Circuit) or open (to break it). A byte is a set of eight bits, for example 0110 1101. A set of four bits is referred to as a nibble. The number of values that can be represented with rn bits is 2°. Two bits can represent 4 different values: 00, 01, 10 and 11. Three bits can represent 8 values and four bits can represent 16 different values, since 2x2x2x2= 16.

## Unit nomenclature

Although we frequently refer to 1024 bytes as a kilobyte, it is, in fact a kibibyte. To avoid any confusion between references to 1024 bytes rather than 1000 bytes, an international collaboration between standards organisations decided in 1996 that kibi would represent 1024, and kilo would represent 1000. Kibi is a combination of the words kilo and binary. The same is true of the other familiar names Mega, Giga and Tera being replaced by mebi, gibi and tebi. The table below outlines the nomenclature for increasing quantities of bytes, in which a KiB is a kibibyte and a MiB, a mebibyte. Name | Symbol | Power | Value Name | Symbol | Power | kibi Ki 2° 1024 Kilo Kork | 10° mebi Mi 220 1,048,576 Mega M 108 gibi Gi 200 1,073,741,824 Giga G 10° tebi Ti 20 1,099,511,627,776 Tera T 10% pebi Pi 20 1,125,899,906,842,624 Peta P 10" exbi Ei 28 1,152,921,504,606,846,976 Exa E 10% zebi Zi 27 1,180,591,620,717,411,303,424 Zetta Z 10?" yobi Yi 20 1,208,925,819,614,629,174,706,176 Yotta Y 10%

## The ASCII code

Historically, the standard code for representing the characters on the keyboard was ASCII (American Standard Code for Information Interchange). This uses seven bits which form 128 different bit combinations, more than enough to cover all of the characters on a standard English-language keyboard. The first 32 codes represent non-printing characters used for control such as backspace (code 8), the Enter or Carriage Return key (code 13) and the Escape key (code 27). The Space character is also included as code 32 and Delete as code 127. Binary |ascu| Dec] Binary |ascu|DEC| Binary | Binary | NULL | 000 000 0000 | space| 032 010 0000 @ 064 100 0000 096 110 0000 SOH | 001 000 0001 ! 033 010 0001 A 065 100 0001 a 097 110 0001 STX | 002 000 0010. 034 010 0010 B 066 100 0010 b 098 110 0010 ETX | 003 000 0011 # 035 010 0011 c 067 100 0011 c 099 1100011 EOT | 004 000 0100 $ 036 010 0100 D 068 100 0100 d 100 1100100 ENQ | 005 000 0101 % 037 010 0101 E 069 100 0101 e 101 1100101 ACK | 006 000 0110 & 038 010 0110 F 070 100 0110 f 102 1100110 BEL | 007 000 0111 ' 039 0100111 G o71 100 0111 re 103 1100111 BS 008 000 1000 ( 040 010 1000 H 072 100 1000 h 104 110 1000 HT 009 000 1001 ) 041 010 1001 i 073 100 1001 i 105 110 1001 LF 010 000 1010. 042 010 1010 J 074 100 1010 j 106 110 1010 VT O11 000 1011 + 043 010 1011 K 075 100 1011 k 107 110 1011 FF 012 000 1100 a 044 010 1100 L 076 100 1100 i] 108 110 1100 CR 013 000 1101 - 045 010 1101 M 077 100 1101 m 109 110 1101 so 014 000 1110 046 010 1110 N 078 100 1110 n 110 110 1110 si 015 000 1111 / 047 010 1111 fe} 079 100 1111 ° 411 1101111 DLE | 016 001 0000 0 048 011 0000 P 080 101 0000 p 112 111 0000 DC1 | 017 001 0001 1 049 011 0001 Q 081 101 0001 q 113 111 0001 DC2 | 018 001 0010 2 050 011 0010 R 082 101 0010 r 114 111.0010 DC3 | 019 001 0011 3 051 011 0011 s 083 101 0011 s 115 1110011 DC4 | 020 001 0100 4 052 011 0100 T 084 101 0100 t 116 111.0100 NAK | 021 001 0101 5 053 011 0101 U 085 101 0101 u 7 111.0101 SYN | 022 001 0110 6 054 0110110 Vv 086 101 0110 v 118 111.0110 ETB | 023 001 0111 7 055 0110111 Ww 087 1010111 w 119 1110111 CAN | 024 001 1000 8 056 011 1000 x 088 101 1000 x 120 111 1000 EM 025 001 1001 9 057 011 1001 Y 089 101 1001 y 121 1111001 SUB | 026 001 1010 058 011 1010 Zz 090 101 1010 z 122 111.1010 ESC | 027 001 1011; 059 011 1011 { 091 101 1011 { 123 1111011 FS 028 001 1100 < 060 011 1100 \ 092 101 1100 | 124 1111100 Gs 029 001 1101 = 061 011 1101 ] 093 101 1101 } 125 1111101 RS 030 001 1110 > 062 011 1110 a 094 101 1110 ~ 126 111.1110 US 031 001 1111 063 0111111 _ 095 101 1111 DEL | 127 111:1111

## Character form of a decimal digit

Although numbers are represented within the code, the number character is not the same as the actual number value. The ASCII value 0110111 will print the character '7', even though the same binary value equates to the decimal number 55. Therefore ASCII cannot be used for arithmetic and would use unnecessary space to store numbers. Numbers for arithmetic are stored as pure binary numbers. '7' + '7' (i.e. 0110111 + 0110111 in ASCII) would be 77, not 14 or 1110.

## The development of ASCII

ASCIl originally used only 7 bits, but an 8-bit version was developed to include an additional 128 combinations to represent symbols such as 2, © and f. You can try holding down the ALT key and typing in the code number using the number pad to type one of these symbols. For example, ALT+130 will produce 6, as used in café. The 7-bit ASCII code is compatible with the 8-bit code and simply adds a leading 0 to all binary codes.

## Unicode

By the 1980s, several coding systems had been introduced all over the world that were all incompatible with one another. This created difficultly as multilingual data was being increasingly used and a new, unified format was sought. As a result, a new 16-bit code called Unicode (UTF-16) was introduced. This allowed for 65,536 different combinations and could therefore represent alphabets from dozens of languages including Latin, Greek, Arabic and Cyrillic alphabets. The first 128 codes were the same as ASCII so compatibility was retained. A further version of Unicode called UTF-32 was also developed to include just over a million characters, and this was more than enough to handle most of the characters from all languages, including Chinese and Japanese. However, Unicode encodings take more storage space than ASCIl, significantly increasing file sizes and transmission times.

## Error checking and correction

Bits can change erroneously during transmission owing to interference. Computers use a variety of systems to verify that the data they receive is actually the same as the data that was sent.

## Parity bits

A parity bit is an additional bit that is used to check that the other bits transmitted are likely to be correct. Using 7-bit ASCII with an 8-bit system meant that there was an extra bit available. This was used as a parity bit. Computers use either odd or even parity, and the parity bit is used to ensure that the total number of 1s in each byte, including the parity bit, equals an odd or even number. For example an R is represented by 1010010 in 7-bit ASCII: O0/1/0;}/1/)/0/0/1)/0 Using odd parity, the parity bit above is the most significant bit, and becomes 0 to make the total number of 1s an odd number - in this case, 3. Using even parity, the parity bit would have been set to 1.

## Majority voting

Majority voting is a system that requires each bit to be sent three times. If a bit value is flipped erroneously during transmission over a noisy line, the recipient computer would use the majority rule and assume that the two bits that have not changed were therefore correct. (0) (e) 1 (0) 0 1 1 te) o}ol4t}ololo}1}1}ofolo}ofajojofi}1}/1]1}o}1}o}o}o In the example above, each bit was sent three times. 00100110 was sent as 000 000 111 000 000 111 111 000 and received as 001 000 110 000 100 111 101 000. In the 1st, 3rd, Sth and 7th bits a transmission error changed one of the bits. Since the majority (two) of the bits were O, in the case of the 1st bit, O was interpreted by the recipient as the intended bit value. The recipient computer can then reassemble the correct values, i.e. 00100110, although you may have realised that the problem with this system is a tripling in the volume of data that is sent.

## Checksums (A Level only)

Achecksum is a mathematical algorithm that is applied to a 'unit' or packet of data, for example a block of 256 bytes. The data in the block is used to create a checksum value which is transmitted with the block. The same algorithm is applied to the block after transmission and if the two checksums match, the transmission is deemed to have been successful. If they do not match, an error must have occurred during transmission and the block should be transmitted again. Asimple example of a checksum algorithm is to add together all of the numerical values of each byte in the block. If any bits change, it is likely, but not guaranteed, to change the checksum, and the block should be resent. In this short block of 3 bytes, the checksum would be 114, i.e. 51+43+20. O/O}1/1}/0}0)1/170}/0}/1/}/0}1}/0}/1]}/1]}0}/0}0}/1}0]1]}0]}0 51 43 20

## Check digits

Accheck digit is similar to a checksum, and is an additional digit at the end of a string of other numbers designed to check for mistakes in input or transmission. Printed books and other products have a unique ISBN (International Standard Book Number) or EAN (European Article Number), a 13-digit number which includes the calculated check digit and is printed with the barcode. The first 12 digits are the unique item number, the 13th is the check digit. This can be calculated using the Modulo 10 system. ISBN 978-0956 143051 9°780956"143051

For example, the ISBN or EAN of 978095614305 has a check digit of 1. This is calculated as follows: ISBN 9 7 8 oO 9 5 6 1 4 3 oO 5 1 Weight 1 3 1 3 1 3 1 3 1 3 1 3 Multiplication 9 21 8 Oo 9 15 6 3 4 9 Oo 15 Addition Add all the numbers 99 Remainder Find the remainder when divided by 10 9 Subtraction Subtract the result from 10 1 The ISBN or EAN digits are given weights of 1 and 3 alternatively. Each value is multiplied by its weight. The multiplied values are added together and divided by 10 to get a remainder of 9. The remainder is subtracted from 10 to give a check digit of 1. The published check digit is read by a barcode scanner, an algorithm to check the check digit is performed and if, as in this case, the digits match, the barcode is deemed, with almost 100% accuracy, to have been read accurately. A similar system works with credit card numbers.


---

## Exercises

1. The ASCII system uses 7 bits to represent a character. The ASCII code in decimal for the numeric character '0' is 48; other numeric characters follow on from this in sequence. (a) Using 7 bits, what is the ASCII code for the character '2' in binary? (1) (b) How many different characters can be represented using ASCII? (1) 2. One character encoding scheme is Unicode. An alternative character encoding scheme is ASCII. (a) State one difference between Unicode and ASCII. (1) (b) State one advantage and one disadvantage of using ASCII rather than Unicode for representing characters. [2] 3. How many times greater is the storage capacity of a 1 terabyte hard disk drive than that of a 256 megabyte hard disk drive? Show each stage of your working. [2] 4. A 'majority voting' system of error checking is used to transmit data, with each bit being sent three times. (a) What will be the final bit pattern received by the user if the following bit pattern is transmitted? [2] O/O;17O0;/0}/O70;/0;/070} 1); 4141/0); 1]71}1)1])1)/0)/070]/1)0 (b) Name one disadvantage of the 'majority voting' system for transmitting data. (1) (c) Assuming the transmission represents a decimal number, what number does it represent? (1) 5. Explain, with the aid of an example, how an even parity system of error checking works when transmitting data. [3]
