#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_image> <output_folder>"
    exit 1
fi

input_image="$1"
output_folder="$2"

if [ ! -f "$input_image" ]; then
    echo "Error: Input file '$input_image' does not exist."
    exit 1
fi

mkdir -p "$output_folder"

resize_image() {
    sips -z $1 $1 "$input_image" --out "$output_folder/icon-$1.png"
}

resize_image 128
resize_image 80
resize_image 64
resize_image 32
resize_image 16

echo "Icon resizing complete. Output saved in $output_folder"