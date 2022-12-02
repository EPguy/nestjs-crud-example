import { Module } from '@nestjs/common';
import { PostsService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './shcemas/post.shcema';
import { PostsController } from './posts.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    ],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
