#!/bin/bash

if [[ ! -d build ]] ; then
    mkdir build
fi

# regular cards
card_layer_ids=( \
    100 \
    101 \
    102 \
    103 \
    104 \
    105 \
    106 \
    107 \
    108 \
    109 \
    110 \
    111 \
    113 \
    115 \
    112 \
    114 \
    116 \
    120 \
    122 \
    123 \
    124 \
    125 \
    126 \
    127 \
    128 \
    129 \
    130 \
    131 \
    133 \
    135 \
    121 \
    132 \
    134 \
    136 \
    140 \
    142 \
    143 \
    144 \
    145 \
    146 \
    147 \
    148 \
    149 \
    150 \
    151 \
    153 \
    155 \
    141 \
    152 \
    154 \
    156 \
    160 \
    162 \
    163 \
    164 \
    165 \
    166 \
    167 \
    168 \
    169 \
    170 \
    171 \
    173 \
    175 \
    161 \
    172 \
    174 \
    176 \
)

inkscape resource-src/card.svg -i layer2 -j -C --export-png=build/plane.png
inkscape resource-src/card.svg -i layer38 -j -C --export-png=build/border.png
inkscape resource-src/card.svg -i layer39 -j -C --export-png=build/shadow.png

app_card__for_html_filenames=()
for layerId in "${card_layer_ids[@]}"; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resource-src/card.svg)

    app_card__for_html_filenames+=(card-kierki-${label}.png)

    # exports the card for the html version
    inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-${label}.scene.forhtml.png --export-area=11:20:228:358

    # adds scene background to the html version
    convert -background none -page +0+0 build/plane.png -page +0+0 build/card-${label}.scene.forhtml.png -layers merge +repage build/card-kierki-${label}.png

    # exports the card drawing scene for the swift version
    inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-${label}.scene.forswift.png 

    # adds border, shadow and plane to swift version
    convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/plane.png -page +0+0 build/card-${label}.scene.forswift.png -layers merge +repage build/card-kierki-${label}-bo-sh.png
done

# card back
card_back_layer_ids=( 37 )
for layerId in "${card_back_layer_ids[@]}" ; do
    label=back

    app_card__for_html_filenames+=(card-kierki-${label}.png)

    # exports the card for the html version
    inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-kierki-${label}.png --export-area=11:20:228:358

    # exports the card drawing scene for the swift version
    inkscape resource-src/card.svg -i layer${layerId} -j -C --export-png=build/card-kierki-${label}.scene.forswift.png

    # adds border and shadow to swift version
    convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/card-kierki-${label}.scene.forswift.png -layers merge +repage build/card-kierki-${label}-bo-sh.png
done

for appCardForHtmlFilename in "${app_card__for_html_filenames[@]}" ; do
    mv build/$appCardForHtmlFilename app/
done