/*
 * @Author: ninemilli.song ninemilli_song@163.com
 * @Date: 2024-01-31 16:37:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-03 11:11:44
 * @FilePath: /nextjs-dashboard/app/ui/bookmark.tsx
 * @Description: 
 * 
 */
import Image from 'next/image'
import { useEffect } from 'react';
import { BookmarkType } from '../lib/definitions';

/**
 * 页签组件
 * @param props 
 * @returns 
 */
export const Bookmark = (props: BookmarkType) => {
    const { href, title, icon } = props;

    return (
        <div>
            <a href={href} target="_blank">
                <Image 
                    src={ icon || '' } 
                    alt='?'
                    width={16}
                    height={16}
                />
                <div>
                    {title}
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
        <div>
            <Image 
                src={ icon || '' } 
                alt='?'
                width={16}
                height={16}
            />
            <h3>
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
        return (
            <div key={uuid}>
                <Tag 
                    uuid={uuid}
                    title={title}
                    icon={icon}
                />
                {children.map(child => {
                    return <BookMarkGroup 
                        key={child.uuid}
                        {...child}
                    />
                })}
            </div>
        )
    } else {
        return <Bookmark {...props}/>
    }
}