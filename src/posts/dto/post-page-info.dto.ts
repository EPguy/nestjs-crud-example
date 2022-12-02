export class PostPageInfoDto {
    readonly hasNextPage: boolean;
    readonly endCursor: string;

    constructor(hasNestPage: boolean, endCursor: string) {
        this.hasNextPage = hasNestPage;
        this.endCursor = endCursor;
    }
}
