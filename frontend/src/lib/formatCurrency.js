/**
 * Indonesian Accounting Currency Formatter
 * Format: Rp X.XXX,XX  (dots for thousands, comma for decimal)
 */

/**
 * Format a number as Indonesian Rupiah.
 * @param {number|string} value
 * @param {boolean} withDecimals - include ,00 decimals (default true)
 * @returns {string}  e.g. "Rp 10.000,00"
 */
export function formatRp(value, withDecimals = true) {
    const num = parseFloat(String(value).replace(/\./g, '').replace(',', '.')) || 0
    const parts = num.toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return withDecimals ? `Rp ${parts[0]},${parts[1]}` : `Rp ${parts[0]}`
}

/**
 * Parse a formatted Rp string back to a plain number.
 * Handles both "Rp 10.000,00" and "10000.00" and "10000,00".
 * @param {string} str
 * @returns {number}
 */
export function parseRpInput(str) {
    if (str == null || str === '') return 0
    // Remove "Rp" prefix and whitespace
    let s = String(str).replace(/^Rp\s*/i, '').trim()
    // If both dot and comma exist, dot is thousands separator, comma is decimal
    if (s.includes('.') && s.includes(',')) {
        s = s.replace(/\./g, '').replace(',', '.')
    } else if (s.includes(',')) {
        // Only comma — treat as decimal separator
        s = s.replace(',', '.')
    }
    return parseFloat(s) || 0
}

/**
 * Format a raw input string as the user types (for use in onChange).
 * Strips non-numeric characters except comma, and reformats.
 * @param {string} rawInput
 * @returns {{ display: string, value: number }}
 */
export function formatOnInput(rawInput) {
    // Strip everything except digits and comma
    const digits = String(rawInput).replace(/[^\d,]/g, '')
    // Split on comma for decimal
    const [intPart, decPart] = digits.split(',')
    // Format integer part with dots
    const formattedInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const display = decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt
    const value = parseRpInput(display)
    return { display, value }
}

/**
 * On-blur formatter — takes whatever is in the input and returns
 * a clean "Rp X.XXX,XX" string and the numeric value.
 */
export function formatOnBlur(rawInput) {
    const value = parseRpInput(rawInput)
    return { display: formatRp(value), value }
}
