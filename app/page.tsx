/*
 * @Author: ninemilli.song ninemilli_song@163.com
 * @Date: 2023-11-29 20:44:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-22 16:42:07
 * @FilePath: /nextjs-dashboard/app/page.tsx
 * @Description: 
 * 
 */
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
// CSS Module
import styles from '@/app/ui/home.module.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import datasource from '@/app/lib/bookmarks.json'
import { BookmarkType } from '@/app/lib/definitions'
import { any } from 'zod';
import { BookMarkGroup } from './ui/bookmark';
import { getBookmarks } from '@/app/lib/actions'


export default async function Page() {
  // const bookmarks = bookmarkDataFormat();
  const bookmarks = await getBookmarks();
  // console.log('bookmarkDataFormat', bookmarks)

  return (
    <main className="min-h-screen p-6 space-y-4">
      {
        bookmarks.map(bookmark => {
          return (
            <BookMarkGroup
              key={bookmark.uuid} 
              {...bookmark}
            />
          )
        })
      }
    </main>
  );
}
