import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostModel, PostDocument } from './shcemas/post.shcema';
import { Model } from 'mongoose';
import { PostCreateDto } from './dto/post-create.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';
import { PostPageInfoDto } from './dto/post-page-info.dto';
import { PostListDto } from './dto/post-list.dto';
import { PostDeleteDto } from './dto/post-delete.dto';
import { hash, compare } from 'bcrypt';
import { PostUpdateDto } from './dto/post-update.dto';

@Injectable()
export class PostsService {
    constructor(@InjectModel('Post') private postModel: Model<PostDocument>) {}

    async create(postCreateDto: PostCreateDto): Promise<PostModel> {
        const hashedPassword = await hash(postCreateDto.password, 10);
        const createdPost = await this.postModel.create({
            ...postCreateDto,
            password: hashedPassword,
        });
        return createdPost;
    }

    async findList(postPaginationDto: PostPaginationDto): Promise<PostListDto> {
        const posts = await this.findPagination(postPaginationDto);
        const endCursor =
            posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;
        const hasNextPage =
            posts.length > 0
                ? await this.existsByIdOlderThan(endCursor)
                : false;
        const postPageInfo = new PostPageInfoDto(hasNextPage, endCursor);
        const postList = new PostListDto(posts, postPageInfo);

        return postList;
    }

    async findOne(id: string): Promise<PostModel> {
        const findedPost = await this.postModel.findOne({ _id: id }).exec();
        if (findedPost === null) {
            throw new HttpException('Not exist id.', HttpStatus.BAD_REQUEST);
        }
        if (findedPost.deleteFlag) {
            throw new HttpException(
                'This post has been deleted.',
                HttpStatus.BAD_REQUEST,
            );
        }
        return findedPost;
    }

    async delete(postDeleteDto: PostDeleteDto): Promise<PostModel> {
        const findPost = await this.postModel
            .findById(postDeleteDto._id)
            .exec();
        const isPasswordCorrect = await compare(
            postDeleteDto.password,
            findPost.password,
        );
        if (!isPasswordCorrect)
            throw new HttpException(
                'Password incorrect.',
                HttpStatus.BAD_REQUEST,
            );

        const deletedPost = await this.postModel
            .findOneAndUpdate(
                { _id: postDeleteDto._id },
                { $set: { deleteFlag: true, modifiedDate: Date.now() } },
                { new: true },
            )
            .exec();
        return deletedPost;
    }

    async update(postUpdateDto: PostUpdateDto): Promise<PostModel> {
        const findPost = await this.postModel.findById(postUpdateDto._id);
        const isPasswordCorrect = await compare(
            postUpdateDto.password,
            findPost.password,
        );
        if (!isPasswordCorrect)
            throw new HttpException(
                'Password incorrect.',
                HttpStatus.BAD_REQUEST,
            );

        const updatedPost = await this.postModel
            .findOneAndUpdate(
                { _id: postUpdateDto._id },
                {
                    $set: {
                        title: postUpdateDto.title,
                        content: postUpdateDto.content,
                        modifiedDate: Date.now(),
                    },
                },
                { new: true },
            )
            .exec();
        return updatedPost;
    }

    private async existsByIdOlderThan(endCursor: string): Promise<boolean> {
        return (
            (await this.postModel.count({
                deleteFlag: false,
                _id: { $lt: endCursor },
            })) > 0
        );
    }

    private async findPagination(
        postPaginationDto: PostPaginationDto,
    ): Promise<PostModel[]> {
        let filterQuery = {};
        if (postPaginationDto.cursor) {
            filterQuery = {
                deleteFlag: false,
                _id: { $lt: postPaginationDto.cursor },
            };
        }
        return await this.postModel
            .find(filterQuery)
            .sort({
                _id: -1,
            })
            .limit(postPaginationDto.numPosts)
            .exec();
    }
}
