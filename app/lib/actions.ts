'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bookmarks_datasource from '@/app/lib/bookmarks.json';
import { arrayToTree } from '@/app/lib/utils';
import { BookmarkType } from './definitions';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number()
            .gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({
    id: true,
    date: true,
});

const UpdateInvoice = FormSchema.omit({
    id: true,
    date: true,
});
 
export async function createInvoice(prevState: State ,formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string, 
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function getBookmarks(): Promise<BookmarkType[]> {
    return new Promise<BookmarkType[]>((resolve, reject) => {
    // 将bookmark 放入title children 中
    const bookmarks_json = Array.prototype.concat([], bookmarks_datasource.bookmarks);
    const titles_json = Array.prototype.concat([], bookmarks_datasource.titles);

    const titles = titles_json.map(title => {
      return {
        'title': title.title,
        'icon': title.icon,
        'uuid': title.uuid,
        'parent_uuid': title.parent_uuid,
        'children': [] as Array<BookmarkType>
      }
    })
    // console.log('titles ', titles)

    // 不在任何分组下
    const top_levle_nodes = []

    // 将页签归类到标题下
    while(bookmarks_json.length > 0) {
      const bm = bookmarks_json.pop();

      if (bm?.parent_uuid === -1) {
        // parent_uuid is -1 has not category
        top_levle_nodes.push(bm)
      } else {
        const title = titles.find(title => title.uuid === bm?.parent_uuid);
        if (title) {
          title.children.push({
            'title': bm?.title,
            'uuid': bm?.uuid,
            'icon': bm?.icon,
            'parent_uuid': bm?.parent_uuid,
            'href': bm?.href,
            'add_date': bm?.add_date
          })
        }
      }
    }
    // console.log('titles group ', titles)

    // 整理标题，根据parent_uuid将标题组建树状结构
    const title_nodes = arrayToTree(titles, -1);
    resolve(Array.prototype.concat(title_nodes, top_levle_nodes));
  })
}

  