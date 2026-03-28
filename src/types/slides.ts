/* eslint-disable */
/* auto-generated types for slides.json */

export interface Section {
  section_name: string;
  section_icon: string;
  section_color: string;
  slides: Slide[];
}

export interface Slide {
  slide_number: number;
  heading: string;
  subheading: string;
  points?: string[];
  stat?: Stat;
  callout?: string;
  linkedinUrl?: string;
  image?: string;
}

export interface Stat {
  value: string;
  label: string;
  source?: string;
}

export interface PresentationData {
  presentation_title: string;
  presentation_subtitle: string;
  tagline: string;
  version: string;
  into_speaker?: {
    name: string;
    designation: string;
  };
  sections: Section[];
}

export type AllSlide = Slide & {
  section_name: string;
  section_icon: string;
  section_color: string;
};