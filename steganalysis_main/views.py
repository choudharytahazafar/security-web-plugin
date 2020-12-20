# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import numpy
from django.shortcuts import render
# Create your views here.
# import the necessary packages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.http import HttpResponse
import numpy as np
import urllib
import json
import cv2
import os
import matplotlib

from keras.optimizers import SGD

from keras.preprocessing.image import load_img
from keras.preprocessing.image import img_to_array
from keras.models import load_model

matplotlib.use('Agg')
from matplotlib import pyplot as plt
import cv2 as cv
from PIL import Image
from PIL import ImageOps
from PIL.ExifTags import TAGS
from matplotlib import pylab
import requests
import base64
from io import BytesIO
import io


class File:
    """
    Attributes:
        file_name: A string containing the file name
        file_type: A string containing the file type (image, video, other)
        file_extension: A string containing the file extension
        file_size: A float containing the size of the file in bytes
        features: A dict containing each type of feature from file for ML -> {feature_set_name: [features]}
        classification: A dict containing of structure { classifier : prediction, etc }
    """

    def __init__(self, file_name):
        self.file_name = file_name
        self.file_type = ''
        self.file_extension = ''
        self.file_size = ''
        self.features = {}
        self.classification = {}

    def set_file_type(self, file_type):
        self.file_type = file_type

    def set_file_extension(self, file_extension):
        self.file_extension = file_extension

    def set_file_size(self, file_size):
        self.file_size = file_size

    def add_features(self, feature_source, feature_list):
        self.features[feature_source] = feature_list

    def update_file(self, file_type, file_extension, file_size):
        self.file_type = file_type
        self.file_extension = file_extension
        self.file_size = file_size

    def set_classification(self, classifier, prediction):
        self.classification[classifier] = prediction


@csrf_exempt
def detect(request):
    # initialize the data dictionary to be returned by the request
    data = {}

    # Accept a POST Request
    if request.method == "POST":

        if len(request.FILES) != 0:
            file = request.FILES['image']
            # data['hello'] = file
            # print(data['hello'])
            bits1 = 2
            key = "User Image"
            img = Image.open(file)
            img1 = Image.open(file)
            image_metadata(data, img, key)
            show_lsb(image=img1, n=bits1)
            analyse(image=img1)
            img2 = Image.open('analyse_plot.png')
            image_enhance(img)
            image_segmentation(img)
            image_restoration(img)
            lowpassfilter(img)
            img3 = Image.open(file)
            clean_image = clear_lsb(image=img3, n=bits1)
            key1 = "User Prediction"
            resNetCNN(data, img, key1)
            plt.subplot(15, 1, 1), plt.imshow(img, 'gray'), plt.title("Original Image", fontsize=10)
            plt.subplot(15, 1, 2), plt.imshow(img1, 'gray'), plt.title("LSB Extracted", fontsize=10)
            plt.subplot(15, 1, 3), plt.imshow(img2, 'gray'), plt.title("LSB Analyze", fontsize=10)
            show_lsb(image=clean_image, n=bits1)
            plt.subplot(15, 1, 15), plt.imshow(clean_image, 'gray'), plt.title("LSB Extracted of Clean Image", fontsize=10)

            plt.subplots_adjust(hspace=.8, wspace=.5)
            plt.savefig('result.png', bbox_inches='tight')  # To save figure
            # plt.show()  # To show figure
            plt.clf()

            with open("result.png", "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')

            data.update({"user_image": image_data})

            # plt.show()

        else:
            # grab the URL from the request
            url1 = request.POST
            bits = 2
            for key in url1:
                print(key)
                key_pred = key + "pred"
                # print(key1)
                url = url1[key]
                img = _grab_image(url=url)
                if not img:
                    continue
                img1 = _grab_image(url=url)
                image_metadata(data, img, key)
                show_lsb(image=img1, n=bits)
                analyse(image=img1)
                img2 = Image.open('analyse_plot.png')
                image_enhance(img)
                image_segmentation(img)
                image_restoration(img)
                lowpassfilter(img)
                img3 = _grab_image(url=url)
                clean_image = clear_lsb(image=img3, n=bits)
                resNetCNN(data, img, key_pred)
                plt.subplot(15, 1, 1), plt.imshow(img, 'gray'), plt.title("Original Image", fontsize=10)
                plt.subplot(15, 1, 2), plt.imshow(img1, 'gray'), plt.title("LSB Extracted", fontsize=10)
                plt.subplot(15, 1, 3), plt.imshow(img2, 'gray'), plt.title("LSB Analyze", fontsize=10)
                show_lsb(image=clean_image, n=bits)
                plt.subplot(15, 1, 15), plt.imshow(clean_image, 'gray'), plt.title("LSB Extracted of Clean Image", fontsize=10)

                plt.subplots_adjust(hspace=.7, wspace=.5)
                plt.savefig('result.png', bbox_inches='tight')  # To save figure
                # plt.show()  # To show figure
                plt.clf()

                with open("result.png", "rb") as image_file:
                    image_data = base64.b64encode(image_file.read()).decode('utf-8')

                data.update({key + "1": image_data})

                # show_lsb(image=image, n=bits)
                # analyse(image=image)
                # plt.show()
            # url=url1["url1"]
            # image = _grab_image(url=url)
            # data.update({'name':  image})

    # return a JSON response

    return JsonResponse(data)
    # return HttpResponse(data)


def _grab_image(url=None):
    try:
        if url is not None:
            # f1 = plt.figure(1)
            # resp = urllib.request.urlopen(url)
            # data = resp.read()

            response = requests.get(url, stream=True)
            response.raw.decode_content = True
            img = Image.open(response.raw)
            image = img.convert('RGB')

            # print(image)
            # plt.imshow(image)
            # plt.show()
            # plt.clf()
            return image
    except Image.UnidentifiedImageError:
        print("URL is not an image or Unidentifiable")
        return False


def show_lsb(image=None, n=None):
    # f2 = plt.figure(2)

    # Shows the n least significant bits of image

    # Used to set everything but the least significant n bits to 0 when
    # using bitwise AND on an integer
    mask = (1 << n) - 1

    color_data = [
        (255 * ((rgb[0] & mask) + (rgb[1] & mask) + (rgb[2] & mask)) // (3 * mask),) * 3
        for rgb in image.getdata()
    ]

    image.putdata(color_data)
    # plt.imshow(image)
    print("_{}LSBs".format(n))


def analyse(image=None):
    # Split the image into blocks
    # Then computing the average value of the LSBs for each block

    BS = 100  # Block size
    (width, height) = image.size
    print
    "[+] Image size: %dx%d pixels." % (width, height)
    conv = image.convert("RGBA").getdata()

    # Extract LSBs
    vr = []  # Red LSBs
    vg = []  # Green LSBs
    vb = []  # LSBs
    for h in range(height):
        for w in range(width):
            (r, g, b, a) = conv.getpixel((w, h))
            vr.append(r & 1)
            vg.append(g & 1)
            vb.append(b & 1)

    # Average colours' LSB per each block
    avgR = []
    avgG = []
    avgB = []
    for i in range(0, len(vr), BS):
        avgR.append(numpy.mean(vr[i:i + BS]))
        avgG.append(numpy.mean(vg[i:i + BS]))
        avgB.append(numpy.mean(vb[i:i + BS]))

    # Creating plot for above gathered data
    numBlocks = len(avgR)
    blocks = [i for i in range(0, numBlocks)]
    plt.figure(figsize=(10, 5))
    plt.axis([0, len(avgR), 0, 1])
    plt.ylabel('Average LSB per block')
    plt.xlabel('Block number')

    #	plt.plot(blocks, avgR, 'r.')
    #	plt.plot(blocks, avgG, 'g')
    plt.plot(blocks, avgB, 'bo')

    plt.savefig("analyse_plot.png")
    plt.clf()


def image_enhance(image=None):
    gray_image = image.convert('L')

    np_gray_image = np.array(gray_image)
    hist = cv2.calcHist([np_gray_image], [0], None, [256], [0, 256])
    plt.figure(figsize=(10, 5))
    plt.xlabel('bins')
    plt.ylabel("No of pixels")
    plt.plot(hist)
    plt.savefig("histogram.png")
    plt.clf()
    hist_img = Image.open('histogram.png')

    gray_img_eqhist = ImageOps.equalize(gray_image)
    np_gray_img_eqhist = np.array(gray_img_eqhist)
    eqhist = cv2.calcHist([np_gray_img_eqhist], [0], None, [256], [0, 256])
    plt.figure(figsize=(10, 5))
    plt.xlabel('bins')
    plt.ylabel("No of pixels")
    plt.plot(eqhist)
    plt.savefig("eq_histogram.png")
    plt.clf()

    plt.subplots(figsize=(36, 22))

    eq_hist_img = Image.open('eq_histogram.png')

    clahe = cv2.createCLAHE(clipLimit=40)
    gray_img_clahe = clahe.apply(np.array(gray_img_eqhist))

    plt.subplot(15, 1, 4), plt.imshow(gray_image, 'gray'), plt.title("Gray Scale Image", fontsize=10)
    plt.subplot(15, 1, 5), plt.imshow(gray_img_eqhist, 'gray'), plt.title("Eq-Gray Scale Image", fontsize=10)
    plt.subplot(15, 1, 6), plt.imshow(hist_img, 'gray'), plt.title("Histogram", fontsize=10)
    plt.subplot(15, 1, 7), plt.imshow(eq_hist_img, 'gray'), plt.title("Equalized Histogram", fontsize=10)
    plt.subplot(15, 1, 8), plt.imshow(gray_img_clahe, 'gray'), plt.title("Contrast Adaptive", fontsize=10)
    plt.imshow(gray_img_clahe, 'gray')
    # plt.savefig('Gray_Image_Clahe.png')
    # plt.clf()


def image_segmentation(image=None):
    gray_image = image.convert('L')
    gray_image_np = np.array(gray_image)

    ret, thresh = cv2.threshold(gray_image_np, 0, 255,
                                cv2.THRESH_BINARY_INV +
                                cv2.THRESH_OTSU)

    # Noise removal using Morphological
    # closing operation
    kernel = np.ones((3, 3), np.uint8)
    closing = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Background area using Dilation
    bg = cv2.dilate(closing, kernel, iterations=1)

    # Finding foreground area
    dist_transform = cv2.distanceTransform(closing, cv2.DIST_L2, 0)
    ret, fg = cv2.threshold(dist_transform, 0.02 * dist_transform.max(), 255, 0)

    plt.subplot(15, 1, 9), plt.imshow(fg, 'gray'), plt.title("Image Segmentation", fontsize=10)
    # plt.clf()


def image_restoration(image=None):
    gray_image = image.convert('L')
    np_gray_image = np.array(gray_image)

    # edge_kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    img = cv2.filter2D(np_gray_image, -1, sharpen_kernel)

    # Smooth out the image
    # blur = cv2.medianBlur(img, 3)
    blur = cv2.GaussianBlur(img, (3, 3), 0)

    plt.subplot(15, 1, 10), plt.imshow(blur, 'gray'), plt.title("Image Restoration", fontsize=10)
    # plt.imshow(blur, 'gray')
    # plt.savefig('Image_Restoration')
    # plt.clf()


def lowpassfilter(image=None):
    # img = cv2.imread(image)
    gray_image = image.convert('L')
    np_gray_image = np.array(gray_image)
    np_image = np.array((image))

    blur = cv2.blur(np_image, (5, 5))
    median = cv2.medianBlur(np_image, 5)
    bl = cv2.bilateralFilter(np_gray_image, 9, 75, 75)
    plt.subplot(15, 1, 11), plt.imshow(blur, 'gray'), plt.title("Blurred", fontsize=10)
    plt.subplot(15, 1, 12), plt.imshow(median, 'gray'), plt.title("Median", fontsize=10)
    plt.subplot(15, 1, 13), plt.imshow(bl, 'gray'), plt.title("Bilateral", fontsize=10)


def resNetCNN(data, image=None, key=None):
    image = image.save("tensor_img.png")

    # load the image
    img = load_img('tensor_img.png', target_size=(224, 224))
    # convert to array
    img = img_to_array(img)
    # reshape into a single sample with 3 channels
    img = img.reshape(1, 224, 224, 3)
    # center pixel data
    img = img.astype('float32')
    img = img - [123.68, 116.779, 103.939]

    # load model
    model = load_model('E:/DJANGO/steganography/steganalysis_main/saved_model/final_model_1_label_categorical_resNet.h5')
    # predict the class
    result = model.predict(img)
    print(result[0])
    # print(result[0,0])
    # print(result[0,1])

    if result[0, 0] > result[0, 1]:
        print("Cover Image Found!")
        data.update({key: {"Result": "Cover Image Detected!"}})
    else:
        print("Stego Image Found!")
        data.update({key: {"Result": "Stego Image Detected!"}})
    # prediction = np.argmax(result, -1)
    # print(prediction)


def clear_lsb(image=None, n=None):
    # using bitwise shift operator to clear least significant bits
    mask = (1 << n) + 64

    color_data = [
        (255 * ((rgb[0] & mask) + (rgb[1] & mask) + (rgb[2] & mask)) // (3 * mask),) * 3
        for rgb in image.getdata()
    ]

    image.putdata(color_data)
    plt.subplot(15, 1, 14), plt.imshow(image, 'gray'), plt.title("Clean Image", fontsize=10)
    return image

def image_metadata(data, image=None, key=None):
    exif = image.getexif()
    creation_time = exif.get(36867)
    exposure_time = exif.get(33434)
    data_time_original = exif.get(36867)
    shutter_speed = exif.get(37377)
    aperture_value = exif.get(37378)
    brightness_value = exif.get(37379)
    focal_length = exif.get(37386)
    file_source = exif.get(41728)
    custom_rendered = exif.get(41985)
    white_balance = exif.get(41987)
    contrast = exif.get(41992)
    saturation = exif.get(41993)
    sharpness = exif.get(41994)

    data.update({key: {"Creation Time": creation_time, "Exposure Time": exposure_time,
                       "Capture Time": data_time_original, "Shutter Speed": shutter_speed,
                       "Aperture Value": aperture_value, "Brightness": brightness_value,
                       "Focal Length": focal_length, "File Source": file_source,
                       "Rendered": custom_rendered, "White Balance": white_balance,
                       "Contrast": contrast, "Saturation": saturation, "Sharpness": sharpness}})
