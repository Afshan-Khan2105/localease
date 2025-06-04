import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const salesType = defineType({
    name: "sale",
    title: "Sale",
    type: "document",
    icon: TagIcon,
    fields: [
        defineField({
            name: "title",
            type: "string",
            title: "Sale Title",
            validation: Rule => Rule.required().error("Sale title is required"),
        }),
        defineField({
            name: "description",
            type: "text",
            title: "Sale Description",
            validation: Rule => Rule.max(300).warning("Keep the description under 300 characters."),
        }),
        defineField({
            name: "discountAmount",
            type: "number",
            title: "Discount Amount (%)",
            description: "Discount percentage (e.g. 10 for 10% off)",
            validation: Rule => Rule.required().min(1).max(100).error("Discount must be between 1 and 100"),
        }),
        defineField({
            name: "couponCode",
            type: "string",
            title: "Coupon Code",
            validation: Rule => Rule.required().error("Coupon code is required"),
        }),
        defineField({
            name: "validFrom",
            type: "datetime",
            title: "Valid From",
            validation: Rule => Rule.required().error("Start date is required"),
        }),
        defineField({
            name: "validUntil",
            type: "datetime",
            title: "Valid Until",
            validation: Rule => Rule.required().error("End date is required"),
        }),
        defineField({
            name: "isActive",
            type: "boolean",
            title: "Is Active",
            description: "Toggle to activate/deactivate the sale",
            initialValue: true,
        }),
        defineField({
            name: "backgroundImage",
            type: "image",
            title: "Background Image",
            description: "Optional background image for the sale banner",
            options: { hotspot: true },
            // No validation needed as this field is optional
        }),
    ],

    preview: {
        select: {
            title: "title",
            discountAmount: "discountAmount",
            couponCode: "couponCode",
            isActive: "isActive",
            media: "backgroundImage",
        },
        prepare(selection) {
            const { title, discountAmount, couponCode, isActive, media } = selection;
            const status = isActive ? "Active" : "Inactive";
            return {
                title: title || "No title",
                subtitle: `${discountAmount ?? "?"}% off - Code: ${couponCode || "N/A"} - ${status}`,
                media,
            };
        },
    },
});