import GoogleMapsInput from "@/components/GoogleMapsInput";
import { TrolleyIcon, PinIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    // Primary image field (if needed)
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    // Field to store multiple images
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      description: "Upload multiple images for this product",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
    }),

    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),

    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),

    // Upgraded location field with address and other details
    defineField({
      name: "location",
      title: "Location",
      type: "object",
      icon: PinIcon,
      fields: [
        defineField({
          name: "latitude",
          title: "Latitude",
          type: "number",
          readOnly: true,
        }),
        defineField({
          name: "longitude",
          title: "Longitude",
          type: "number",
          readOnly: true,
        }),
        defineField({
          name: "address",
          title: "Address",
          type: "string",
          readOnly: true,
        }),
        defineField({
          name: "radius",
          title: "Radius (km)",
          type: "number",
          description: "Define the area where the product is available.",
          initialValue: 5,
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
      components: {
        input: GoogleMapsInput, // Custom component handling location (GPS + manual adjustments)
      },
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "image",
      price: "price",
      location: "location",
    },
    prepare({ title, price, media, location }) {
      return {
        title,
        subtitle: `₹${new Intl.NumberFormat("en-IN").format(price)} - 📍 ${location?.address || "No location set"}`,
        media,
      };
    },
  },
});
