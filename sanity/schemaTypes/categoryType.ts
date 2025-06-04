import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required().error('Title is required'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required().error('Slug is required'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      validation: Rule => Rule.max(200).warning('Keep the description under 200 characters.'),
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
    prepare(selection) {
      return {
        ...selection,
        title: selection.title || 'No title',
      }
    },
  },
});
