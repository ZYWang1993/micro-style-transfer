from PIL import Image
import os


def convertimage(filename, style):
    s = filename.split('.')
    last = s[1]
    if style:
        im=Image.open(filename)
        im.save('s_'+s[0]+'.jpg')
    else:
        im=Image.open(filename)
        im.save('c_'+s[0]+'.jpg')
    if last != 'jpg':
        os.remove(filename)
