from setuptools import setup, find_packages

setup(name='ggiot',
      version='0.1',
      description='ggiot code',
      author='teuteuguy',
      license='MIT',
      packages=find_packages(),
      install_requires=[
          'greengrasssdk',
      ],
      zip_safe=False)
