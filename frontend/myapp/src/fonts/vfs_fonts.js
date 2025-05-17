import pdfMake from 'pdfmake/build/pdfmake';

// Create our custom vfs object for fonts
const vfs = {};

// Define fonts configuration
pdfMake.fonts = {
    // Default font will use the built-in Roboto
    Roboto: {
        normal: 'Roboto',
        bold: 'Roboto',
        italics: 'Roboto',
        bolditalics: 'Roboto'
    },
    // Arabic font
    Amiri: {
        normal: 'https://fonts.gstatic.com/s/amiri/v17/J7aRnpd8CGxBHpUrtLMA7w.ttf',
        bold: 'https://fonts.gstatic.com/s/amiri/v17/J7acnpd8CGxBHp2VkaY6zp5yGw.ttf',
        italics: 'https://fonts.gstatic.com/s/amiri/v17/J7afnpd8CGxBHpUrhL8Y67FZQ.ttf',
        bolditalics: 'https://fonts.gstatic.com/s/amiri/v17/J7aanpd8CGxBHpUrjAo9_plqHwA.ttf'
    }
};

// Set the virtual file system
pdfMake.vfs = vfs;

export default pdfMake;
