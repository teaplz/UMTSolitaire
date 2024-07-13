# 🀄 Unicode Mahjong Tile Solitaire 🀄

**[Unicode Mahjong Tile Solitaire](https://teaplz.github.io/2ctilesol)** 
is a simple web adaptation of the [Mahjong solitaire](https://en.wikipedia.org/wiki/Mahjong_solitaire) puzzle game that does not use any custom images or fonts for displaying tiles, instead utilizing the [Mahjong Tiles Unicode block](https://en.wikipedia.org/wiki/Mahjong_Tiles_(Unicode_block)) with standard fonts, either adjusted with CSS to better resemble tiles or using non-standard emoji variants (namely Microsoft's Segoe UI Emoji).

## The Game

### Traditional

This version is currently not implemented.

### Two-Corner

In "Two-Corner", tiles are no longer stacked on top of each-other and all tiles are now considered exposed, but can only be matched as a pair if they follow the rule of "nikakudori" (or "two-angle take"):

- When matching pairs, a path of 1-3 orthogonal line segments must be imagined between them so that no line touches any other tile. This, by definition, forms less than three right angles, or up to two "corners".

More information on this game can be found [in this Wikipedia article](https://en.wikipedia.org/wiki/Shisen-Sho).

## The Tech

![](../../actions/workflows/github-pages.yaml/badge.svg)

This project was developed with [React](https://reactjs.org/), uses the [Vite](https://vitejs.dev/) toolchain, and is hosted on [GitHub Pages](https://pages.github.com/). Some technical features of the game include:

* Randomized board generation, both with a purely-random shuffle (used for the game's "Hard Mode") and a unique shuffle that does not generate unwinnable boards. Supports seeding for replayable games and an option to share game boards.

* Custom layout editor, with a "layout code" to allow sharing custom layouts.

* Reponsive game window, adjusting automatically to window size, orientation, and pointer style. When played on a portrait screen (such as a phone held upright), the board layout is rotated to make the most use of space.

* From-scratch algorithms to generate the game board and detect valid matches.

* Limited [PWA](https://en.wikipedia.org/wiki/Progressive_web_application) support.

The game will not display correctly in earlier browsers and may not display correctly with certain fonts.

---

<p align="center">
    <a href="./readme/desktop-emoji.png"><img src="./readme/desktop-emoji-t.png" title="A game board rendered using non-standard emojis"></a><br/>
    A game board rendered using non-standard emojis, via the font Segoe UI Emoji on Windows 10.
</p>

<p align="center">
    <a href="./readme/desktop-glyph.png"><img src="./readme/desktop-glyph-t.png" title="A game board rendered using non-standard emojis"></a><br/>
    The same board rendered using the same font, but as Unicode glyphs.
</p>

---

The source code is licensed under the [MIT license](LICENSE).