/*
 * @Author: ninemilli.song ninemilli_song@163.com
 * @Date: 2024-01-31 16:37:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-22 17:13:20
 * @FilePath: /nextjs-dashboard/app/ui/bookmark.tsx
 * @Description: 
 * 
 */
import Image from 'next/image'
import { useEffect } from 'react';
import { BookmarkType } from '../lib/definitions';

const default_icon = require('../../public/customers/evil-rabbit.png').default;

/**
 * 页签组件
 * @param props 
 * @returns 
 */
export const Bookmark = (props: BookmarkType) => {
    const { href, title, icon, description } = props;

    return (
        <div className='group flex max-w-60 h-12 px-3 border rounded-xl border-gray-300 shadow hover:border-red-300/60'>
            <a 
                className='grow flex flex-row items-center space-x-3 overflow-hidden'
                href={href} 
                target="_blank"
            >
                <div
                    className='flex-none w-8 h-8 rounded-2xl overflow-hidden'
                >
                    <Image 
                        className='w-full h-full'
                        src={ icon || default_icon } 
                        alt='?'
                        width={16}
                        height={16}
                    />
                </div>
                
                <div className='grow flex h-10 overflow-hidden items-center'>
                    <span className='grow overflow-hidden whitespace-nowrap text-ellipsis text-sm group-hover:text-orange-500 group-hover:underline'>
                        {title}
                    </span>
                </div>
            </a>
        </div>
    )
}

/**
 * 分组标签
 * @param props 
 * @returns 
 */
export const Tag = (props: BookmarkType) => {
    const { href, title, icon } = props
    return (
        <div className='flex w-48 h-12 px-3 border-gray-300 items-center'>
            {/* <Image 
                className='flex-none w-6 h-6'
                src={ icon || '' } 
                alt='?'
                width={16}
                height={16}
            /> */}
            <h3 className='grow overflow-hidden whitespace-nowrap text-ellipsis text-base font-medium subpixel-antialiased'>
                {title}
            </h3>
        </div>
    )
}

/**
 * 页签组
 * @param props 
 * @returns 
 */
export const BookMarkGroup = (props: BookmarkType) => {
    const {
        uuid,
        title,
        href,
        icon,
        children
    } = props;

    if (children && children.length > 0) {
        // 当前分组中遍历出的 bookmark 数据， 因为bookmark需要用容器包装，从而做到flex布局
        const singles = [] as BookmarkType[];
        // 当前分组中提取分组数据，每个分组区域独占一行
        const groups = [] as BookmarkType[];
        children.forEach(child => {
            if (!child.children) {
                singles.push(child);
            }
            else groups.push(child);
        })
        
        return (
            <div 
                className='flex flex-col'
                key={uuid}
            >
                <Tag 
                    uuid={uuid}
                    title={title}
                    icon={icon}
                />
                <div
                    className='grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 auto-cols-max gap-4'
                >
                    {singles.map(single => {
                        return <BookMarkGroup 
                            key={single.uuid}
                            {...single}
                        />
                    })}
                </div>
                {groups.map(group => {
                    return <BookMarkGroup 
                        key={group.uuid}
                        {...group}
                    />
                })}
            </div>
        )
    } else {
        return <Bookmark {...props}/>
    }
}