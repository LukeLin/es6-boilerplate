import "babel-core/polyfill";

const tmpl = addrs => html`
    <table>
    ${addrs.map(addr => html`
        <tr>$${addr.first}</tr>
        <tr>$${addr.last}</tr>
    `)}
    </table>
`;

console.log(tmpl([
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
]));

function html(templateObject, ...substs) {
    // Use raw template strings: we don’t want
    // backslashes (\n etc.) to be interpreted
    let raw = templateObject.raw;

    let result = '';

    substs.forEach((subst, i) => {
        // Retrieve the template string preceding
        // the current substitution
        let lit = raw[i];

        // In the example, map() returns an Array:
        // If substitution is an Array (and not a string),
        // we turn it into a string
        if (Array.isArray(subst)) {
            subst = subst.join('');
        }

        // If the substitution is preceded by a dollar sign,
        // we escape special characters in it
        if (lit.endsWith('$')) {
            subst = htmlEscape(subst);
            lit = lit.slice(0, -1);
        }
        result += lit;
        result += subst;
    });
    // Take care of last template string
    // (Never fails, because an empty tagged template
    // produces one template string, an empty string)
    result += raw[raw.length-1]; // (A)

    return result;
}

function htmlEscape(str) {
    return str.replace(/&/g, '&amp;') // first!
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}


