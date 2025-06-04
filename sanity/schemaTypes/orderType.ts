import { defineType, defineField, defineArrayMember } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique order identifier (auto-generated or from payment gateway)",
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
      validation: (Rule) => Rule.min(8).max(20),
    }),
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "productName",
              type: "string",
              title: "Product Name (Snapshot)",
              description: "Name at time of order",
            }),
            defineField({
              name: "productImage",
              type: "image",
              title: "Product Image (Snapshot)",
            }),
            defineField({
              name: "quantity",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "price",
              type: "number",
              title: "Unit Price",
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: "total",
              type: "number",
              title: "Total Price",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "cod" },
          { title: "Credit/Debit Card", value: "card" },
          { title: "UPI", value: "upi" },
          { title: "Net Banking", value: "netbanking" },
          { title: "Wallet", value: "wallet" },
        ],
      },
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Returned", value: "returned" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coupon",
      title: "Coupon/Sale Applied",
      type: "reference",
      to: [{ type: "sale" }],
      description: "Reference to applied sale/coupon, if any",
    }),
    defineField({
      name: "orderNotes",
      title: "Order Notes",
      type: "text",
      description: "Special instructions or notes for this order",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
});