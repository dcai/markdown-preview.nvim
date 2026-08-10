const matchesSeparator = (separators, value) => {
  return separators.some(separator => new RegExp(`^${separator}$`).test(value))
}

export const meta = (separators = [['---'], ['---']]) => {
  return md => {
    md.block.ruler.before('code', 'meta', (state, start, end, silent) => {
      if (start !== 0 || state.blkIndent !== 0 || state.tShift[start] < 0) {
        return false
      }

      const getLine = line => {
        return state.src.slice(state.bMarks[line], state.eMarks[line])
      }

      if (!matchesSeparator(separators[0], getLine(start))) {
        return false
      }

      let line = start + 1
      while (line < end && state.tShift[line] >= 0) {
        if (matchesSeparator(separators[1], getLine(line))) {
          if (!silent) {
            state.line = line + 1
          }
          return true
        }
        line += 1
      }

      return false
    }, {
      alt: []
    })
  }
}
