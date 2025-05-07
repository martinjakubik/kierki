#!/bin/bash

if [[ ! -d build ]] ; then
    mkdir build
fi

inkscape resource-src/card.svg -i layer38 -j -C --export-png=build/border.png
inkscape resource-src/card.svg -i layer39 -j -C --export-png=build/shadow.png

# regular cards
for layerId in {1..36}; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resource-src/card.svg)

    # exports two versions of the drawing scene
    echo inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-kierki-${label}.scene.forhtml.png --export-area=11:20:228:358
    echo inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-kierki-${label}.scene.forswift.png 

    # adds border and shadow to swift version
    echo convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/card-kierki-${label}.forswift.png -layers merge +repage build/card-kierki-${label}-bo-sh.png
done

# card back
for layerId in {layer37}; do
    label=card-back

    # exports two versions of the drawing scene
    echo inkscape resource-src/card.svg -i g10562 -j -C --export-png=build/${label}.forswift.png
    echo inkscape resource-src/card.svg -i g10562 -j -C --export-png=build/${label}.png --export-area=11:20:228:358

    # adds border and shadow to swift version
    echo convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/${label}.forswift.png -layers merge +repage build/${label}-bo-sh.png
done