---
chapter: 16
title: "Bitmapped graphics"
section: 3
section_title: "Data representation"
spec_area: "4.5"
spec_area_title: "Fundamentals of data representation"
level: "AS / A Level (Year 12)"
pdf_pages: "92-97"
figures: 0
source: "AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0"
---

# Chapter 16 — Bitmapped graphics
## Objectives

« Understand how bitmapped images are represented in terms of size in pixels, resolution and colour depth

- Be able to calculate storage requirements for a bitmap image
- Be aware that images contain metadata and be able to describe typical metadata

## Representation of bitmapped images

A bitmap (or raster) image contains many picture elements or pixels, that make up the whole image. A pixel is the smallest identifiable area of an image. Each pixel is attributed a binary value which represents a single colour.

## Resolution

The resolution of an image can be expressed as the width in pixels x height in pixels. This does not determine the size of the image, simply the number of pixels within it. Assuming an image's physical dimensions remain the same, then the greater the number of pixels it contains, the sharper the image, as the pixels must become smaller to fit inside its boundaries. 100 x 67 pixels 1000 x 670 pixels Sometimes resolution is expressed as the number of pixels per inch or PPI. This indicates the density of the pixels, rather than the actual image dimensions. 72PPI is a standard screen resolution, and images with a resolution greater than this will not appear any better on screen. Print quality requires images at 300PPI to print in photographic quality. DPI (or Dots Per Inch) is a printing term relating to the number of ink dots per inch on a page and is often confused with PPI. Some newer screens, including smartphones, can have a screen resolution of up to 400PPI. This makes. pixels so small that they can no longer be easily distinguished by the human eye without the aid of a microscope.

## Colour depth

Each pixel in an image has a binary value attributed to it. The number of bits determines the number of combinations (as n bits gives 2" combinations), and this determines the number of colours that a pixel can represent. Each binary value represents a single colour, and the number of bits per pixel is referred to as the colour depth.

Asimple black and white image will only require one bit per pixel, 0 to represent black and 1 to represent white. This icon image has a resolution of 7x7 pixels, with 49 pixels in total. If each pixel is represented by one bit, the total image file size (ignoring metadata) will be 49 bits. Once we begin to introduce colour, or increase the number of colours in the image, the number of bits that each pixel will need must be increased to allow for a greater number of combinations. This image, although identical in size, has four colours, and will therefore require two bits per pixel to offer four combinations. The file size (ignoring metadata) will therefore double to 98 bits, with 2 bits x 49 pixels. One byte per pixel will offer 256 different colours, 16 bits will give 65,536 colours and 24 bits will allow for over 16 million colours —- approaching the number that the human eye can detect. This has become the current standard with 256 colour values (8 bits) per channel: red, green and blue. Where 32 bits are used, the last 8 bits are either ignored or used for an alpha channel to control transparency.

## Metadata

Metadata is best described as data about data. In the case of image metadata, details such as the image width in pixels, height in pixels and colour depth.

The storage of this additional data with the file helps to explain why your calculated image size may not equal exactly what the computer shows as the image size. Another reason is compression which can dramatically reduce the size of an image.

## Vector graphics (A Level only)

Vector graphics are represented quite differently. Rather than storing information on each individual pixel and building an image from them, vector images are made up of geometric shapes or objects such as lines, curves, arcs and polygons. A vector file stores only the necessary details about each shape in order to redraw the object when the file loads. To recreate an image of a circle, a computer must store its properties, including the position of its centre within the image, its radius, fill colour, line colour and line weight.

## Vector drawing lists

These properties are stored in a drawing list which specifies how to redraw the image. If the image is resized on screen, the computer will adjust the position and dimensions of the image properties and redraw the image perfectly every time. A bitmapped image will pixelate. The drawing list item for the circle above might appear in a drawing list like this: Vector drawing list Circle (centre = x,y, radius = r, fill = blue, stroke = red, weight = 3px) Rectangle (position = x,y, width = 20, height = 60, fill = yellow, stroke = none) Line (start = x,y, end = x,y, stroke = green, weight = 1px)

Regardless of how large these shapes are drawn, the image will always be sharp, and the amount of data required to store the image will not change.

## Vector graphics versus bitmapped graphics

A vector image usually has a much smaller file size and will scale perfectly, regardless of how large or small you make it. A logo is often best created as a vector graphic since the company is then able to print it crisply on anything from a business card to a billboard. 3.3KB 1.9KB Bitmap Vector Since they are often smaller files, vectors use less memory and storage space, transmit faster and often load more quickly. Why then, are bitmap images used at all? A vector image cannot easily replicate an 3-16 image with continuous areas of changing colour such as a photograph, taken with a digital camera. Take this image below, with a vectorised equivalent. Theoretically, if you created a vector image with squares of solid colour, each 1 pixel in size, you would be able to replicate a bitmap exactly; but your file would need to store a single list item for each pixel — far more than a short binary value. Note the difference in file size and quality here: 84KB - Original bitmap 1.2MB - Vectorised version Individual pixels can be manipulated within a bitmap image — useful in the case of photo retouching, for example. With a vector image, individual objects are easily manipulated, but individual pixels cannot be changed.


---

## Exercises

1. Images are often represented in a computer's main memory using bitmapped graphics. Bitmapped images consist of pixels. A pixel is the smallest addressable part of an image. (a) What is meant by the resolution of a bitmapped graphic image? [2] (b) What is meant by the colour depth of a bitmapped graphic image? [2] An image has 10 x 10 pixels. It is stored in an image format that is limited to 16 colours. (c) Calculate the image size in bytes. [2] Instead of using bitmapped graphics, images may be represented in a computer's main memory using vector graphics. (d) State one advantage of vector graphics compared with bitmapped graphics. (1) AQA Comp 1 Qu 3 June 2011 A bitmapped image consists of pixels. The figure below shows a bitmapped representation of an image of a winking, happy face consisting of red, blue, black and white pixels only. (a) Why must at least two bits be used to represent each pixel? (1) The second line of pixels (from the top) has been represented in a computer's memory as the bit pattern 1111 1100 0011 1111. A black pixel is coded as 11. (b) Suggest a suitable 16-bit bit pattern that could be used to represent the third row of pixels. [2] (c) What, in bytes, is the minimum file size for the bitmapped image? [3] Instead of representing the face as a bitmapped image, vector graphics could have been used. (d) State three items of data that would need to be stored about an eye object, similar to those shown in the image in the above figure, if it is to be represented using vector graphics. [3] (e) Describe two advantages of using vector graphics instead of bitmaps to represent an image. [2] AQA Comp 1 Qu 5 June 2012
