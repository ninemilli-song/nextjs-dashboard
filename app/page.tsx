/*
 * @Author: ninemilli.song ninemilli_song@163.com
 * @Date: 2023-11-29 20:44:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-03 11:20:51
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
import { arrayToTree } from '@/app/lib/utils'
import { BookMarkGroup } from './ui/bookmark';


function bookmarkDataFormat(): Array<BookmarkType> {
    // 将bookmark 放入title children 中
    const bookmarks_json = datasource.bookmarks;
    const titles_json = datasource.titles;

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
    return Array.prototype.concat(title_nodes, top_levle_nodes);
}

export default function Page() {
  const bookmarks = bookmarkDataFormat();
  // console.log('bookmarkDataFormat', bookmarks)

  return (
    <main className="flex min-h-screen flex-col p-6">
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
