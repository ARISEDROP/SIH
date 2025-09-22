import jsPDF from 'jspdf';
import { hindFont } from './hindFont';
import { hindSiliguriFont } from './hindSiliguriFont';

// A map of font names to their Base64 encoded data
const fonts: { [key: string]: string } = {
    'Hind-Regular.ttf': hindFont,
    'HindSiliguri-Regular.ttf': hindSiliguriFont,
};

/**
 * Adds custom fonts that support Indian scripts to a jsPDF instance.
 * This function loads the font data into the virtual file system of the PDF document,
 * making them available for use with doc.setFont().
 * @param doc The jsPDF instance to which the fonts will be added.
 */
export function addCustomFonts(doc: jsPDF): void {
    // Add Hind font for Devanagari script (Hindi)
    doc.addFileToVFS('Hind-Regular.ttf', fonts['Hind-Regular.ttf']);
    doc.addFont('Hind-Regular.ttf', 'Hind', 'normal');

    // Add Hind Siliguri font for Bengali script (Bengali, Assamese, Manipuri)
    doc.addFileToVFS('HindSiliguri-Regular.ttf', fonts['HindSiliguri-Regular.ttf']);
    doc.addFont('HindSiliguri-Regular.ttf', 'HindSiliguri', 'normal');
}
