import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query, UseFilters,
} from '@nestjs/common';
import { PostsService } from './post.service';
import { PostListDto } from './dto/post-list.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';
import { PostCreateDto } from './dto/post-create.dto';
import { PostModel } from './shcemas/post.shcema';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostDeleteDto } from './dto/post-delete.dto';
import { HttpExceptionFilter } from '../exceptions/http-exception-filter';

@Controller('posts')
@UseFilters(new HttpExceptionFilter())
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    async create(@Body() postCreateDto: PostCreateDto): Promise<PostModel> {
        return this.postsService.create(postCreateDto);
    }

    @Get()
    async findPagination(
        @Query() postPagination: PostPaginationDto,
    ): Promise<PostListDto> {
        return this.postsService.findList(postPagination);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PostModel> {
        return this.postsService.findOne(id);
    }

    @Put()
    async updateOne(@Body() postUpdateDto: PostUpdateDto): Promise<PostModel> {
        return this.postsService.update(postUpdateDto);
    }

    @Delete()
    async deleteOne(@Body() postDeleteDto: PostDeleteDto): Promise<PostModel> {
        return this.postsService.delete(postDeleteDto);
    }
}
