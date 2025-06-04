// schemas/product.ts
import { defineArrayMember, defineField, defineType } from "sanity";
import { TrolleyIcon, PinIcon } from "@sanity/icons";
import { GoogleMapsInput } from "@/components/GoogleMapsInput";

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
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        })
      ],
      description: "Upload multiple images for this product",
      validation: (Rule) => Rule.unique(),
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
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "category" }]
        })
      ]
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "ratings",
      title: "Ratings & Comments",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          title: "Rating",
          fields: [
            defineField({
              name: "username",
              title: "Username",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "score",
              title: "Score",
              type: "number",
              validation: (Rule) => Rule.required().min(1).max(5),
            }),
            defineField({
              name: "comment",
              title: "Comment",
              type: "text",
              validation: (Rule) => Rule.max(500).warning("Keep comments under 500 characters"),
            }),
            defineField({
              name: "createdAt",
              title: "Date",
              type: "datetime",
              readOnly: true,
            }),
          ],
          preview: {
            select: { score: "score", username: "username" },
            prepare({ score, username }) {
              return { title: `${score} ★ by ${username}` };
            },
          },
        }),
      ],
      description: "User ratings and comments",
    }),
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
          validation: (Rule) => Rule.min(-90).max(90).warning("Latitude must be between -90 and 90"),
        }),
        defineField({
          name: "longitude",
          title: "Longitude",
          type: "number",
          readOnly: true,
          validation: (Rule) => Rule.min(-180).max(180).warning("Longitude must be between -180 and 180"),
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
          initialValue: 5,
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
      components: { input: GoogleMapsInput },
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      price: "price",
      latitude: "location.latitude",
      longitude: "location.longitude",
      ratings: "ratings",
    },
    prepare({ title, price, media, latitude, longitude, ratings }: any) {
      const count = ratings?.length || 0;
      const total = ratings?.reduce((sum: number, r: any) => sum + r.score, 0) || 0;
      const avg = count ? (total / count).toFixed(1) : "N/A";
      return {
        title,
        subtitle: `₹${new Intl.NumberFormat("en-IN").format(price)} • ★ ${avg} (${count}) • 📍${latitude?.toFixed(4) ?? "?"}, ${longitude?.toFixed(4) ?? "?"}`,
        media,
      };
    },
  },
});