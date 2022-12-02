import { PostModel } from '../shcemas/post.shcema';
import { PostPageInfoDto } from './post-page-info.dto';

export class PostListDto {
    readonly posts: PostModel[];
    readonly pageInfo: PostPageInfoDto;

    constructor(posts: PostModel[], pageInfo: PostPageInfoDto) {
        this.posts = posts;
        this.pageInfo = pageInfo;
    }
}
