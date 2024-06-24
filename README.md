# RegEx Poetry Machine

<p>Place two words in a space. What does the topography look like, to traverse between them? Where do meanings fold and multiply? What can we imagine if we draw the two together like shards of coloured glass?</p>
<p>This is a tool for making what I call RegEx pattern poems. Inspired by <a href="https://angelhousepress.com/essays/waber-regular-expressions-as-a-system-of-poetic-notation-plus-bio.pdf">Dan Waber</a>, Kate’s <a href="https://x.com/happyautomata">vaguely reassuring state machines</a>, and R. F. Kuang’s <i><a href="https://bookshop.org/p/books/babel-or-the-necessity-of-violence-an-arcane-history-of-the-oxford-translators-revolution-r-f-kuang/18269577">Babel</a></i>, pattern poems are one-word poetic programs that reappropriate <a href="https://en.wikipedia.org/wiki/Regular_expression">regular</a> <a href="https://www.regexone.com/">expressions</a> as a layered incantation of inarticulate intimations.</p>
<p>These ideas have also been ferried around in the vehicles of other projects, including <a href="https://www.coem-lang.org/">Coem</a> and <a href="https://www.proseplay.net/">ProsePlay</a>.</p>

## Notes
- word association game! change one letter in a word (change in place, add, or remove) to set up some sort of association between two ideas
https://twitter.com/kayserifserif/status/1674604020437073920
- a big feature of coem is using regex as a structure to contain/communicate multiple meanings
https://twitter.com/kayserifserif/status/1535218928279900161
- (regex) pattern poems—a thing that feels, to me, like a digital version of the the silver translation bars in R. F. Kuang's Babel !!!
https://twitter.com/kayserifserif/status/1674604020437073920

## Seeds

homophone poem
- mist + missed -> mis(t|sed)
- see + sea -> se[ea]
- prey + pray -> pr[ea]y
- morning + mourning -> mou?rning
- words + worlds -> worl?ds
- exit + exist -> exis?t
- seep + sleep -> sl?eep

@happyautomata: touched + together -> to(uched|gether)

word association game
- bookmaking + bookmarking -> bookmar?king
- bookcase + bookcare -> bookca[sr]e
- sheaf + shelf -> she[al]f
- amen + amend -> amend?
- poetry + pottery -> po(et|tte)ry

contributions
- tried + cried -> [tc]ried
- dalliance + alliance -> d?alliance
- heart + hope -> h(eart|ope)
- cloud + cling -> c(loud|ing)
- sparkle + sprinkling -> sp(arkle|rinkling)
- honeydew + drizzle -> (honey)?d(ew|rizzle)

- make + mend -> m(ake|end)
- 💗💜💙 + 💗💛💙 -> 💗(💜|💛)💙
- heart + hearth -> hearth?
- heart + heartstring -> heart(string)?

## Ideas

- reverse regex -> strings?
- pull from rhyming dictionary, or words that look similar?
- shared beginning/end/middle - is there one best algorithm or good to keep the options?
- strings -> regex -> strings -> regex; reinterpreting; performance