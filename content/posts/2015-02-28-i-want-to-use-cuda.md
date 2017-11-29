+++
Categories = []
Tags = [ "cuda" ]
date = "2015-02-28T16:23:42+09:00"

title = "CUDAを使いたい"

+++

cudaを使いたいと思ったので使ってみました。

<!--more-->

{{< figure src="/images/2015-02-28/julia_gpu.jpg" >}}<br>
画像はGPUを使って描いたジュリア集合ってやつです。<br>
と言っても、本に書いてあったサンプルコードをちょこっと変えただけなので、<br>
あまり頭は使ってません。<br>
<a href=http://www.amazon.co.jp/dp/4844329782/ref=nosim/?tag=impressjapan-22&linkCode=as1>
CUDA by Example 汎用GPUプログラミング入門
</a>
<br>
ただ、本の通りにやろうとしたらサポートページが見つからなかったので、<br>
必要なライブラリやらヘッダファイルやらが手に入らない状態でした。<br>
そのへんは、opencvを使ってなんとかしています。<br>
cuComplexも仕様が変わったのか、コンパイル時にエラーだしていたので<br>
ふつうに複素数の計算してます。


my_cuda.h

        #define CUDA_HANDLE_ERROR(CUDA_FUNC)                         \
        if( CUDA_FUNC != cudaSuccess ) {                             \
          printf("FILE:%s, LINE:%d in function %s failure\n",        \
                  __FILE__, __LINE__, __func__);                     \
          exit(1);                                                   \
        }

julia_gpu.cu

        #include <cv.h>
        #include <highgui.h>
        #include "my_cuda.h"

        #define DIM 1000

        __device__ int julia( int x, int y) {
          const float scale = 1.5;
          float jx = scale * (float)(DIM/2 - x)/(DIM/2);
          float jy = scale * (float)(DIM/2 - y)/(DIM/2);
          
          float cx = -0.8;
          float cy = 0.156;

          float tmp_x;
          float tmp_y;
          //cuComplex c(-0.8, 0.156);
          //cuComplex a(jx, jy);

          int i = 0;
          for (i = 0; i < 200; i++) {
            tmp_x = jx * jx - jy * jy + cx;
            tmp_y = 2 * jx * jy + cy;

            if (tmp_x * tmp_x + tmp_y * tmp_y > 1000000)
              return 0;
    
            jx = tmp_x;
            jy = tmp_y;
            //a = a * a + c;
            //if (a.magnitude2() > 1000)
            //  return 0;
          }
          return 1;
        }

        __global__ void kernel (unsigned char *ptr) {
          int x = blockIdx.x;
          int y = blockIdx.y;
          int offset = x + y * gridDim.x;
          
          int juliaValue = julia(x, y);
          ptr[offset] = 255 * juliaValue;
        }

        int main(void) {
          IplImage *dst_img = cvCreateImage(cvSize(DIM,DIM), IPL_DEPTH_8U, 1);
          cvSetZero(dst_img);
          unsigned char *dev_bitmap;

          CUDA_HANDLE_ERROR(cudaMalloc( (void**)&dev_bitmap,
                                       DIM*DIM));

          dim3 grid(DIM,DIM);
          kernel<<<grid,1>>>(dev_bitmap);
          
          CUDA_HANDLE_ERROR(cudaMemcpy( dst_img->imageData,
                                        dev_bitmap,
                                        DIM*DIM,
                                        cudaMemcpyDeviceToHost ) );
          
          CUDA_HANDLE_ERROR(cudaFree(dev_bitmap));
          
          cvNamedWindow("result", CV_WINDOW_AUTOSIZE);
          cvShowImage("result", dst_img);
          cvWaitKey(0);
          
          cvSaveImage("dst_img1.jpg", dst_img, 0);
          
          cvReleaseImage(&dst_img);

          return 0;
        }

おなじディレクトリにファイルを置いて、<br>
コンパイル。

        $ nvcc julia_gpu.cu -o julia_gpu `pkg-config --cflags opencv` -L`pkg-config --libs opencv`

以上、覚え書き程度に。