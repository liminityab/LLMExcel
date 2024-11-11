#!/bin/bash

# Define the Excel add-in cache directories
CACHE_DIRS=(
    "$HOME/Library/Containers/com.microsoft.Excel/Data/Library/Caches/Microsoft/Office/16.0/Wef/"
    "$HOME/Library/Containers/com.microsoft.Excel/Data/Library/Application Support/Microsoft/Office/16.0/Wef/"
)

echo "Clearing Excel add-in cache..."

for DIR in "${CACHE_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        echo "Clearing cache in $DIR"
        rm -rf "$DIR"/*
    else
        echo "Directory not found: $DIR"
    fi
done

echo "Excel add-in cache cleared."
echo "Please restart Excel for the changes to take effect."