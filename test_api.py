# import the necessary packages
import requests
import cv2
import json
import urllib
import os
from django.http import JsonResponse
import django.http
# define the URL to our face detection API
url = "http://127.0.0.1:8000/steganalysis/detect/"
# use our face detection API to find faces in images via image URL
payload = {"url1": "https://www.pyimagesearch.com/wp-content/uploads/2015/05/obama.jpg"}
payload.update({"url2": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Deepika_Padukone_Cannes_2018_%28cropped%29.jpg/220px-Deepika_Padukone_Cannes_2018_%28cropped%29.jpg"
		   })
payload.update({'url3': "https://www.biography.com/.image/t_share/MTY2MzU3Nzk2OTM2MjMwNTkx/elon_musk_royal_society.jpg"})
r = requests.post(url, data=payload).json()
print ("obama.jpg: {}".format(r))

# show the output image
 
# load our image and now use the face detection API to find faces in
# images by uploading an image directly
# image = cv2.imread("adrian.jpg")
# payload = {"image": open("adrian.jpg", "rb")}
# r = requests.post(url, files=payload).json()
# print "adrian.jpg: {}".format(r)

#image = cv2.imread("taha.jpg")
#payload = {"image": open("taha.jpg", "rb")}
# r = requests.post(url, files=payload).json()
#print ("taha.jpg: {}".format(r))
 
## loop over the faces and draw them on the image
#for (startX, startY, endX, endY) in r["faces"]:
#	cv2.rectangle(image, (startX, startY), (endX, endY), (0, 255, 0), 2)

##show the output image
#cv2.imshow("taha.jpg", image)
#cv2.waitKey(0)

